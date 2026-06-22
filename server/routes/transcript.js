import { Router } from 'express';
import Session from '../models/Session.js';
import { extractVideoId, fetchTranscript, fetchVideoMetadata } from '../services/youtube.js';

const router = Router();

/**
 * POST /api/transcript
 *
 * Accepts a YouTube URL, fetches its transcript and metadata,
 * creates a new chat session in MongoDB, and returns it.
 *
 * Body: { url: string }
 * Response: The created Session document
 */
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;
    const userId = req.headers['x-user-id'] || 'anonymous';

    // Validate input
    if (!url) {
      return res.status(400).json({ error: 'YouTube URL is required' });
    }

    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Fetch transcript and metadata in parallel
    const [transcript, metadata] = await Promise.all([
      fetchTranscript(url),
      fetchVideoMetadata(url).catch(() => ({ title: null, thumbnail: null })),
    ]);

    // Create a new session in the database
    const session = await Session.create({
      userId,
      videoId,
      videoUrl: url,
      videoTitle: metadata.title,
      thumbnail: metadata.thumbnail,
      transcript,
      messages: [],
    });

    return res.status(201).json(session);
  } catch (error) {
    console.error('Error creating transcript session:', error.message);
    return res.status(500).json({ error: error.message || 'Failed to fetch transcript' });
  }
});

export default router;
