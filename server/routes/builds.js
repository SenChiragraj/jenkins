import { Router } from 'express';
import { Build, Job } from '../models/models.js';
import { authenticateToken } from '../middleware/auth.js';

const router = Router();

router.use(authenticateToken);

// Get build history for a specific job
router.get('/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    // Verify job ownership for security
    const job = await Job.findOne({ _id: jobId, owner: req.user.id });
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // Fetch builds sorted by newest first, limit to 20
    const builds = await Build.find({ job: jobId })
      .sort({ startedAt: -1 })
      .limit(20);

    res.json(builds);
  } catch (err) {
    console.error('Error fetching build history:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get logs for a specific build
router.get('/:buildId/logs', async (req, res) => {
  try {
    const { buildId } = req.params;

    const build = await Build.findById(buildId).populate('job');
    if (!build) return res.status(404).json({ message: 'Build not found' });

    // Verify ownership of the build's job
    if (build.job.owner.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Forbidden' });
    }

    res.json({ logs: build.logs });
  } catch (err) {
    console.error('Error fetching build logs:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
