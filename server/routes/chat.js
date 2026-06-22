import { Router } from 'express';
import Session from '../models/Session.js';
import { generateChatResponse } from '../services/nvidia.js';

const router = Router();

/**
 * POST /api/chat
 *
 * Accepts a sessionId and user message, streams the AI response
 * back as Server-Sent Events (SSE).
 *
 * Body: { sessionId: string, message: string }
 * Response: SSE stream of JSON chunks, ending with [DONE]
 */
router.post('/', async (req, res) => {
  try {
    const { sessionId, message } = req.body;

    // Validate input
    if (!sessionId || !message) {
      return res.status(400).json({ error: 'sessionId and message are required' });
    }

    // Find the session and verify ownership
    const userId = req.headers['x-user-id'] || 'anonymous';
    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session) {
      return res.status(404).json({ error: 'Session not found' });
    }

    // Push the user's message into the session history and save
    session.messages.push({ role: 'user', content: message });
    await session.save();

    // Set SSE headers for streaming response
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    // Create an AbortController to kill the request if the client disconnects
    const abortController = new AbortController();
    req.on('close', () => {
      abortController.abort();
    });

    // Stream the AI response chunk by chunk
    let isFinished = false;

    const fullResponse = await generateChatResponse(
      session.transcript,
      session.messages,
      abortController.signal,
      (chunk) => {
        if (!res.writableEnded && !res.destroyed) {
          res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
        }
      }
    );

    isFinished = true;

    // ALWAYS save the assistant's complete response, even if the user disconnected
    if (fullResponse) {
      session.messages.push({ role: 'assistant', content: fullResponse });
      await session.save();
    }

    if (!res.writableEnded && !res.destroyed) {
      // Signal the end of the stream
      res.write('data: [DONE]\n\n');
      res.end();
    }
  } catch (error) {
    if (error.name === 'AbortError') {
      console.log('Client disconnected. Aborting NVIDIA AI generation.');
      return;
    }
    console.error('Error in chat route:', error.message);

    if (!res.writableEnded && !res.destroyed) {
      // If headers haven't been sent yet, return a JSON error
      if (!res.headersSent) {
        return res.status(500).json({ error: error.message || 'Chat request failed' });
      }

      // If already streaming, send error as an SSE event
      res.write(`data: ${JSON.stringify({ error: error.message || 'Chat request failed' })}\n\n`);
      res.end();
    }
  }
});

export default router;
