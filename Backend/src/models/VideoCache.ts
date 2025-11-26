// models/VideoCache.ts
import { Schema, model } from 'mongoose';

const videoCacheSchema = new Schema({
  videoId: { type: String, required: true, unique: true },
  title: String,
  description: String,
  thumbnailUrl: String,
  viewCount: Number,
  likeCount: Number,
  commentCount: Number,
  lastFetched: { type: Date, default: Date.now }
});

export const VideoCache = model('VideoCache', videoCacheSchema);