// server.ts
import dotenv from 'dotenv';
dotenv.config(); // Load env first

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import videoRouter from './src/routes/video';
import commentRouter from './src/routes/comments';
import noteRouter from './src/routes/notes';
import eventLogRouter from './src/routes/eventLogs';

const app = express();

// Debug: Check environment variables
console.log('=== Environment Check ===');
console.log('CLIENT_ID exists:', !!process.env.GOOGLE_CLIENT_ID);
console.log('CLIENT_SECRET exists:', !!process.env.GOOGLE_CLIENT_SECRET);
console.log('REFRESH_TOKEN exists:', !!process.env.REFRESH_TOKEN);
console.log('VIDEO_ID:', process.env.VIDEO_ID);
console.log('========================');

// CORS Configuration
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true, // Allow cookies if needed
  optionsSuccessStatus: 200
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/youtube-dashboard')
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/video', videoRouter);
app.use('/api/comments', commentRouter);
app.use('/api/notes', noteRouter);
app.use('/api/event-logs', eventLogRouter);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});