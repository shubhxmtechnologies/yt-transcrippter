import mongoose from 'mongoose';

// Message sub-schema for chat history
const messageSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      enum: ['user', 'assistant'],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// Session schema — represents a single video chat session
const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    videoId: {
      type: String,
      required: true,
    },
    videoTitle: {
      type: String,
    },
    videoUrl: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    },
    transcript: {
      type: String,
      required: true,
    },
    messages: [messageSchema],
  },
  {
    timestamps: true, // Adds createdAt and updatedAt automatically
  }
);

const Session = mongoose.model('Session', sessionSchema);

export default Session;
