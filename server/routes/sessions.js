import { Router } from 'express';
import Session from '../models/Session.js';

const router = Router();

/**
 * GET /api/sessions
 *
 * Returns all sessions sorted by most recently updated.
 * Excludes the full transcript and messages to keep responses lightweight.
 */
router.get('/', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const sessions = await Session.find({ userId })
      .sort({ updatedAt: -1 })
      .select('videoId videoTitle thumbnail createdAt updatedAt');

    return res.json(sessions);
  } catch (error) {
    console.error('Error fetching sessions:', error.message);
    return res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

/**
 * GET /api/sessions/:id
 *
 * Returns a single session by ID, including the full transcript and messages.
 */
router.get('/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const session = await Session.findOne({ _id: req.params.id, userId });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.json(session);
  } catch (error) {
    console.error('Error fetching session:', error.message);
    return res.status(500).json({ error: 'Failed to fetch session' });
  }
});

/**
 * DELETE /api/sessions/:id
 *
 * Deletes a session by ID.
 */
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const session = await Session.findOneAndDelete({ _id: req.params.id, userId });

    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    return res.json({ message: 'Session deleted successfully' });
  } catch (error) {
    console.error('Error deleting session:', error.message);
    return res.status(500).json({ error: 'Failed to delete session' });
  }
});

export default router;
