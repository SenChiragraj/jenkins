import { spawn } from 'child_process';
import { Build } from '../models/models.js';

// A simple FIFO queue to hold jobs to run
const jobQueue = [];
let isRunning = false;

/**
 * Add a job to the queue and start processing if idle
 * @param {Object} job - Mongoose Job document
 * @param {Function} onLog - callback to send logs in real-time
 */
export async function enqueueJob(job, onLog) {
  return new Promise((resolve, reject) => {
    jobQueue.push({ job, onLog, resolve, reject });
    if (!isRunning) {
      processQueue();
    }
  });
}

/**
 * Process jobs in the queue one by one
 */

async function processQueue() {
  if (jobQueue.length === 0) {
    isRunning = false;
    return;
  }
  isRunning = true;

  const { job, onLog, resolve, reject } = jobQueue.shift();

  try {
    const build = new Build({
      job: job._id,
      status: 'running',
      startedAt: new Date(),
    });
    await build.save();

    onLog(`Starting build for job: ${job.name}\n`);

    // Run each step sequentially

    const workspace = await prepareWorkspace(job, job.config);
    for (const step of job.config.steps) {
      onLog(`\n> Step: ${step.name}\n`);
      await runShellCommand(step.run, onLog, workspace);
    }

    build.status = 'success';
    build.finishedAt = new Date();
    await build.save();

    onLog('\nBuild completed successfully.\n');
    resolve(build);
    console.log(build.logs);
  } catch (error) {
    // On error, update build status and reject
    onLog(`\nBuild failed: ${error.message}\n`);

    // Save failure status to DB
    const build = await Build.findOne({ job: job._id, status: 'running' }).sort(
      { startedAt: -1 }
    );
    if (build) {
      build.status = 'failed';
      build.finishedAt = new Date();
      build.logs += `\nBuild failed: ${error.message}`;
      await build.save();
    }
    reject(error);
  } finally {
    processQueue(); // Process next job
  }
}

import simpleGit from 'simple-git';
import fs from 'fs-extra';
import path from 'path';

async function prepareWorkspace(job, buildConfig) {
  const workspace = path.join(process.cwd(), 'workspace', job._id.toString());
  await fs.ensureDir(workspace);

  const git = simpleGit(workspace);
  const repoUrl = addCredentialsToUrl(
    job.config.repo.url,
    job.config.repo.credentials
  );

  if (await fs.pathExists(path.join(workspace, '.git'))) {
    await git.pull();
  } else {
    await git.clone(repoUrl, workspace);
  }

  await git.checkout(buildConfig.branch || job.config.repo.branch);
  return workspace;
}

function addCredentialsToUrl(url, credentials) {
  if (credentials.token) {
    return url.replace(
      'https://',
      `https://x-token-auth:${credentials.token}@`
    );
  }
  return url;
}

/**
 * Run a shell command and stream output via onLog callback
 * @param {string} cmd - Shell command to run
 * @param {Function} onLog - Callback to send logs
 */
function runShellCommand(cmd, onLog, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    const shell = spawn(cmd, {
      shell: true,
      cwd,
      env: { ...process.env, PATH: process.env.PATH },
    });

    shell.stdout.on('data', (data) => {
      // console.log('STDOUT:', data.toString()); // Debug
      onLog(data.toString());
    });

    shell.stderr.on('data', (data) => {
      // console.log('STDERR:', data.toString()); // Debug
      onLog(data.toString());
    });

    shell.on('error', (err) => {
      reject(err);
    });

    shell.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Command "${cmd}" exited with code ${code}`));
    });
  });
}
