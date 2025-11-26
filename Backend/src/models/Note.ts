// models/Note.ts
import { Schema, model } from 'mongoose';

const noteSchema = new Schema({
  videoId: { type: String, required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export const Note = model('Note', noteSchema);
