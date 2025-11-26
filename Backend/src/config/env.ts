import dotenv from 'dotenv';

// Load environment variables FIRST
dotenv.config();

// Validate required variables
const requiredEnvVars = [
  'YOUTUBE_API_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
  'REFRESH_TOKEN',
  'VIDEO_ID',
  'MONGODB_URI'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
}

// Export typed config
export const config = {
  port: process.env.PORT || 3000,
  mongodbUri: process.env.MONGODB_URI!,
  youtubeApiKey: process.env.YOUTUBE_API_KEY!,
  videoId: process.env.VIDEO_ID!,
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  redirectUri: process.env.REDIRECT_URI!,
  refreshToken: process.env.REFRESH_TOKEN!
};