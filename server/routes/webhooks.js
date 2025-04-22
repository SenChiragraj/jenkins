// routes/webhooks.js
import { Router } from 'express';
import { Job } from '../models/models.js';
import { enqueueJob } from '../services/jobExecutor.js';

const router = Router();

router.post('/:jobId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).send('Job not found');

    // Verify webhook signature
    if (!verifySignature(job, req)) return res.status(403).send('Invalid signature');

    // Determine event type
    const event = getEventType(req.headers);
    const payload = parsePayload(job.config.repo.provider, req.body);

    // Trigger build
    await enqueueJob(job, (msg) => console.log(msg), {
      branch: payload.branch,
      commit: payload.commit,
      pr: payload.pr
    });

    res.status(202).send('Build triggered');
  } catch (err) {
    res.status(500).send('Server error');
  }
});

function verifySignature(job, req) {
  const secret = job.config.repo.secret;
  // Implementation varies by provider
  // Example for GitHub:
  const sig = req.headers['x-hub-signature-256'];
  const hmac = crypto.createHmac('sha256', secret);
  const digest = `sha256=${hmac.update(JSON.stringify(req.body)).digest('hex')}`;
  return sig === digest;
}

export default router;
