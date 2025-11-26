// models/EventLog.ts
import { Schema, model } from 'mongoose';

const eventLogSchema = new Schema({
  eventType: {
    type: String,
    required: true,
    enum: ['VIDEO_FETCHED', 'VIDEO_UPDATED', 'COMMENT_ADDED', 'COMMENT_DELETED', 'REPLY_ADDED', 'NOTE_ADDED', 'NOTE_DELETED']
  },
  userId: String,
  videoId: String,
  commentId: String,
  noteId: String,
  metadata: Schema.Types.Mixed,
  
  timestamp: { type: Date, default: Date.now }
});

export const EventLog = model('EventLog', eventLogSchema);
