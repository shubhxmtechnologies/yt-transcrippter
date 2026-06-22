# TranscriptAI Backend (Server)

This is the Node.js / Express backend for the TranscriptAI application. It acts as the orchestration layer between the React client, the YouTube API, the MongoDB database, and NVIDIA's Nemotron 120B LLM.

## Tech Stack

- **Framework**: Express.js
- **Database**: MongoDB (via Mongoose)
- **AI Integration**: NVIDIA NIM (`nvidia-nemotron-3-super-120b-a12b`) using Server-Sent Events (SSE) for streaming.
- **Transcript Extraction**: `youtube-transcript`

## Key Features

1. **Transcript Fetching**: Automatically extracts captions/transcripts from YouTube URLs.
2. **AI Chat Streaming**: Uses Server-Sent Events (SSE) to stream chunks of AI responses back to the client in real-time.
3. **Session Management**: Saves chat history, transcripts, and metadata in MongoDB, allowing you to resume past sessions.
4. **AbortController Integration**: If a user disconnects or cancels a generation on the client, the server will cleanly abort the underlying HTTP request to NVIDIA to save tokens and bandwidth.

## Environment Variables

Create a `.env` file in this directory and configure the following variables:

```env
PORT=3000
MONGODB_URI=mongodb://127.0.0.1:27017/ai-youtube-transcript
NVIDIA_API_KEY=your_nvidia_api_key_here
```

## Available Scripts

### `npm run dev`
Starts the development server with watch mode using Node 20+ built-in `--watch` flag.

### `npm run start`
Starts the server in production mode.
