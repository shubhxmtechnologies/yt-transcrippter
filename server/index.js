import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

// Import route handlers
import transcriptRoutes from './routes/transcript.js';
import chatRoutes from './routes/chat.js';
import sessionsRoutes from './routes/sessions.js';

const app = express();
const PORT = process.env.PORT || 5000;

// ─── Middleware ───────────────────────────────────────────────
app.use(
  cors({
    origin: [process.env.CLIENT],
  })
);
app.use(express.json());

// ─── API Routes ───────────────────────────────────────────────
app.use('/api/transcript', transcriptRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/sessions', sessionsRoutes);

// ─── Health Check ─────────────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─── MongoDB Connection & Server Start ────────────────────────
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
}

// Handle MongoDB connection errors after initial connect
mongoose.connection.on('error', (error) => {
  console.error('❌ MongoDB connection error:', error.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
});

startServer();
