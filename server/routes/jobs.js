import { Router } from 'express';
import { Job } from '../models/models.js';
import { enqueueJob } from '../services/jobExecutor.js';

const router = Router();

// Get all jobs for logged-in user
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find({ owner: req.user.id }).exec();
    res.json(jobs);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create a new job
router.post('/', async (req, res) => {
  try {
    const job = new Job(req.body);

    // Create webhook if repo configured
    if (job.config.repo?.url) {
      const gitService = getGitService(job);
      const webhookUrl = `${process.env.APP_URL}/api/webhooks/${job._id}`;
      job.webhookId = await gitService.createWebhook(
        job._id,
        job.config.repo.url,
        webhookUrl
      );
    }

    await job.save();
    res.status(201).json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update a job
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, config } = req.body;

  try {
    const job = await Job.findOneAndUpdate(
      { _id: id, owner: req.user.id },
      {
        name: name || undefined,
        description: description || undefined,
        config: config || undefined,
      },
      { new: true }
    );

    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json(job);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete a job
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const job = await Job.findOneAndDelete({
      _id: id,
      owner: req.user.id,
    });

    if (!job) return res.status(404).json({ message: 'Job not found' });
    res.json({ message: 'Job deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Trigger job execution manually
router.post('/:id/trigger', async (req, res) => {
  try {
    const job = await Job.findOne({ _id: req.params.id, owner: req.user.id });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // For demo, logs will be collected in a string and sent back after completion
    let logs = '';
    const onLog = (msg) => {
      logs += msg;
      // TODO: For real-time, integrate with WebSocket or SSE here
    };

    await enqueueJob(job, onLog);

    res.json({ message: 'Job executed', logs });
  } catch (err) {
    console.log(err);

    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
