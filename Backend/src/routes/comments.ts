// src/routes/comments.ts
import { Router, Request, Response } from 'express';
import { getYouTubeClient } from '../config/youtube.js';
import { CommentCache } from '../models/commentCache';

const router = Router();

// // ✅ GET - Fetch comments (you already have this)
// router.get('/', async (req: Request, res: Response) => {
//   try {
//     const videoId = process.env.VIDEO_ID;
//     const youtube = getYouTubeClient();
    
//     if (!videoId) {
//       return res.status(400).json({ error: 'VIDEO_ID not configured' });
//     }

//     const response = await youtube.commentThreads.list({
//       part: ['snippet', 'replies'],
//       videoId: videoId,
//       maxResults: 100,
//       order: 'time'
//     });

//     const comments = response.data.items?.map(item => ({
//       id: item.id,
//       authorName: item.snippet?.topLevelComment?.snippet?.authorDisplayName,
//       authorProfileImage: item.snippet?.topLevelComment?.snippet?.authorProfileImageUrl,
//       text: item.snippet?.topLevelComment?.snippet?.textDisplay,
//       likeCount: item.snippet?.topLevelComment?.snippet?.likeCount,
//       publishedAt: item.snippet?.topLevelComment?.snippet?.publishedAt,
//       replyCount: item.snippet?.totalReplyCount
//     })) || [];

//     res.json(comments);
//   } catch (error) {
//     console.error('Error fetching comments:', error);
//     res.status(500).json({ error: 'Failed to fetch comments' });
//   }
// });

// // ✅ POST - Add new comment (ADD THIS!)
// router.post('/', async (req: Request, res: Response) => {
//   try {
//     const { text } = req.body;
//     const videoId = process.env.VIDEO_ID;
//     const youtube = getYouTubeClient();

//     console.log('📨 Posting comment:', text);

//     if (!text || !text.trim()) {
//       return res.status(400).json({ error: 'Comment text is required' });
//     }

//     if (!videoId) {
//       return res.status(400).json({ error: 'VIDEO_ID not configured' });
//     }

//     const response = await youtube.commentThreads.insert({
//       part: ['snippet'],
//       requestBody: {
//         snippet: {
//           videoId: videoId,
//           topLevelComment: {
//             snippet: {
//               textOriginal: text
//             }
//           }
//         }
//       }
//     });

//     console.log('✅ Comment posted successfully');

//     // Return the new comment in same format as GET
//     const newComment = {
//       id: response.data.id,
//       authorName: response.data.snippet?.topLevelComment?.snippet?.authorDisplayName,
//       authorProfileImage: response.data.snippet?.topLevelComment?.snippet?.authorProfileImageUrl,
//       text: response.data.snippet?.topLevelComment?.snippet?.textDisplay,
//       likeCount: 0,
//       publishedAt: response.data.snippet?.topLevelComment?.snippet?.publishedAt,
//       replyCount: 0
//     };

//     res.status(201).json(newComment);
//   } catch (error: any) {
//     console.error('❌ Error posting comment:', error.response?.data || error.message);
    
//     // Handle specific YouTube API errors
//     if (error.response?.data?.error) {
//       const ytError = error.response.data.error;
//       return res.status(ytError.code || 500).json({ 
//         error: ytError.message || 'YouTube API error' 
//       });
//     }
    
//     res.status(500).json({ error: 'Failed to post comment' });
//   }
// });

// ✅ POST - Reply to a comment (ADD THIS TOO!)
router.post('/:commentId/reply', async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;
    const youtube = getYouTubeClient();

    console.log('📨 Posting reply to:', commentId);

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Reply text is required' });
    }

    const response = await youtube.comments.insert({
      part: ['snippet'],
      requestBody: {
        snippet: {
          parentId: commentId,
          textOriginal: text
        }
      }
    });

    console.log('✅ Reply posted successfully');

    res.status(201).json({
      id: response.data.id,
      authorName: response.data.snippet?.authorDisplayName,
      text: response.data.snippet?.textDisplay,
      publishedAt: response.data.snippet?.publishedAt
    });
  } catch (error: any) {
    console.error('❌ Error posting reply:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to post reply' });
  }
});

// ✅ DELETE - Delete a comment (ADD THIS TOO!)
router.delete('/:commentId', async (req: Request, res: Response) => {
  try {
    const { commentId } = req.params;
    const youtube = getYouTubeClient();

    console.log('🗑️ Deleting comment:', commentId);

    await youtube.comments.delete({
      id: commentId
    });

    console.log('✅ Comment deleted successfully');
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error: any) {
    console.error('❌ Error deleting comment:', error.response?.data || error.message);
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

// ✅ GET - Update field names
router.get('/', async (req: Request, res: Response) => {
  try {
    const videoId = process.env.VIDEO_ID;
    const youtube = getYouTubeClient();
    
    if (!videoId) {
      return res.status(400).json({ error: 'VIDEO_ID not configured' });
    }

    const response = await youtube.commentThreads.list({
      part: ['snippet', 'replies'],
      videoId: videoId,
      maxResults: 100,
      order: 'time'
    });

    const comments = response.data.items?.map(item => ({
      id: item.id,
      // ✅ Changed field names to match frontend
      authorDisplayName: item.snippet?.topLevelComment?.snippet?.authorDisplayName,
      authorProfileImageUrl: item.snippet?.topLevelComment?.snippet?.authorProfileImageUrl,
      textDisplay: item.snippet?.topLevelComment?.snippet?.textDisplay,
      likeCount: item.snippet?.topLevelComment?.snippet?.likeCount,
      publishedAt: item.snippet?.topLevelComment?.snippet?.publishedAt,
      replyCount: item.snippet?.totalReplyCount,
      canDelete: true  // ✅ Add this for delete button
    })) || [];

    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// ✅ POST - Update field names
router.post('/', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    const videoId = process.env.VIDEO_ID;
    const youtube = getYouTubeClient();

    console.log('📨 Posting comment:', text);

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    if (!videoId) {
      return res.status(400).json({ error: 'VIDEO_ID not configured' });
    }

    const response = await youtube.commentThreads.insert({
      part: ['snippet'],
      requestBody: {
        snippet: {
          videoId: videoId,
          topLevelComment: {
            snippet: {
              textOriginal: text
            }
          }
        }
      }
    });

    console.log('✅ Comment posted successfully');

    // ✅ Return with correct field names
    const newComment = {
      id: response.data.id,
      authorDisplayName: response.data.snippet?.topLevelComment?.snippet?.authorDisplayName,
      authorProfileImageUrl: response.data.snippet?.topLevelComment?.snippet?.authorProfileImageUrl,
      textDisplay: response.data.snippet?.topLevelComment?.snippet?.textDisplay,
      likeCount: 0,
      publishedAt: response.data.snippet?.topLevelComment?.snippet?.publishedAt,
      replyCount: 0,
      canDelete: true
    };

    res.status(201).json(newComment);
  } catch (error: any) {
    console.error('❌ Error posting comment:', error.response?.data || error.message);
    
    if (error.response?.data?.error) {
      const ytError = error.response.data.error;
      return res.status(ytError.code || 500).json({ 
        error: ytError.message || 'YouTube API error' 
      });
    }
    
    res.status(500).json({ error: 'Failed to post comment' });
  }
});
export default router;