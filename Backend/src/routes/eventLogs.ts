// routes/eventLogs.ts
import { Router } from 'express';
import { EventLog } from '../models/EventLog';

const router = Router();

// GET /api/event-logs - Fetch all event logs
router.get('/', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string || '100');
    const logs = await EventLog.find()
      .sort({ timestamp: -1 })
      .limit(limit);
    
    res.json(logs);
  } catch (error) {
    console.error('Error fetching event logs:', error);
    res.status(500).json({ error: 'Failed to fetch event logs' });
  }
});

export default router;