// src/routes/video.ts
import { Router, Request, Response } from 'express';
import { getYouTubeClient } from '../config/youtube.js';
import { VideoCache } from '../models/VideoCache.js';
import { EventLog } from '../models/EventLog.js';

const router = Router();

// GET /api/video - Fetch video details
router.get('/', async (req: Request, res: Response) => {
  try {
    const videoId = process.env.VIDEO_ID;
    const youtube = getYouTubeClient();  // Get client when request comes in
    
    if (!videoId) {
      return res.status(400).json({ error: 'VIDEO_ID not configured' });
    }
    
    const response = await youtube.videos.list({
      part: ['snippet', 'statistics'],
      id: [videoId]
    });

    const video = response.data.items?.[0];
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const videoData = {
      id: video.id,
      title: video.snippet?.title,
      description: video.snippet?.description,
      thumbnailUrl: video.snippet?.thumbnails?.high?.url,
      viewCount: video.statistics?.viewCount,
      likeCount: video.statistics?.likeCount,
      commentCount: video.statistics?.commentCount
    };

    await VideoCache.findOneAndUpdate(
      { videoId },
      { ...videoData, lastFetched: new Date() },
      { upsert: true, new: true }
    );

    await EventLog.create({
      eventType: 'VIDEO_FETCHED',
      videoId,
      metadata: { title: videoData.title }
    });

    res.json(videoData);
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

// PUT /api/video - Update video
router.put('/', async (req: Request, res: Response) => {
  try {
    const { title, description } = req.body;
    const videoId = process.env.VIDEO_ID;
    const youtube = getYouTubeClient();

    if (!videoId) {
      return res.status(400).json({ error: 'VIDEO_ID not configured' });
    }

    const currentVideo = await youtube.videos.list({
      part: ['snippet'],
      id: [videoId]
    });

    const currentSnippet = currentVideo.data.items?.[0]?.snippet;
    
    if (!currentSnippet) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // await youtube.videos.update({
    //   part: ['snippet'],
    //   requestBody: {
    //     id: videoId,
    //     snippet: {
    //       title,
    //       description,
    //       categoryId: currentSnippet.categoryId || '22',
    //       tags: currentSnippet.tags
    //     }
    //   }
    // });

    await VideoCache.findOneAndUpdate(
      { videoId },
      { title, description, updatedAt: new Date() },
      { new: true }
    );

    await EventLog.create({
      eventType: 'VIDEO_UPDATED',
      videoId,
      metadata: { title, description }
    });

    res.json({ success: true, title, description });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({ error: 'Failed to update video' });
  }
});

export default router;