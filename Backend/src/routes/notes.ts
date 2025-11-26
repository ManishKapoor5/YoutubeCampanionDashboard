// routes/notes.ts
import { Router } from 'express';
import { Note } from '../models/Note';
import { EventLog } from '../models/EventLog';

const router = Router();

// GET /api/notes - Fetch all notes
router.get('/', async (req, res) => {
  try {
    const videoId = process.env.VIDEO_ID;
    const notes = await Note.find({ videoId }).sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    console.error('Error fetching notes:', error);
    res.status(500).json({ error: 'Failed to fetch notes' });
  }
});

// POST /api/notes - Add a note
router.post('/', async (req, res) => {
  try {
    const { content } = req.body;
    const videoId = process.env.VIDEO_ID;

    const note = await Note.create({
      videoId,
      content
    });

    // Log event
    await EventLog.create({
      eventType: 'NOTE_ADDED',
      videoId,
      noteId: note._id.toString(),
      metadata: { content }
    });

    res.json(note);
  } catch (error) {
    console.error('Error adding note:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// DELETE /api/notes/:noteId - Delete a note
router.delete('/:noteId', async (req, res) => {
  try {
    const noteId = req.params.noteId;
    await Note.findByIdAndDelete(noteId);

    // Log event
    await EventLog.create({
      eventType: 'NOTE_DELETED',
      videoId: process.env.VIDEO_ID,
      noteId
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});

export default router;
