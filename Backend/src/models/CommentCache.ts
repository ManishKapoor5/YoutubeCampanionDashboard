// src/models/CommentCache.ts
import { Schema, model } from 'mongoose';

const commentCacheSchema = new Schema({
  commentId: {
    type: String,
    required: true,
    unique: true
  },
  videoId: {
    type: String,
    required: true,
    index: true
  },
  authorName: String,
  authorProfileImage: String,
  text: String,
  likeCount: Number,
  publishedAt: Date,
  replyCount: Number,
  
  // For tracking user actions
  isHidden: { type: Boolean, default: false },
  isPinned: { type: Boolean, default: false },
  userNote: String,
  
  lastFetched: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const CommentCache = model('CommentCache', commentCacheSchema);