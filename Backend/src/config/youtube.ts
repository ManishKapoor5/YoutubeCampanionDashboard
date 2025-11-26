// src/config/youtube.ts
import { google } from 'googleapis';

let youtubeClient: ReturnType<typeof google.youtube> | null = null;
let oauth2Client: InstanceType<typeof google.auth.OAuth2> | null = null;

export function getOAuth2Client() {
  if (!oauth2Client) {
    // ✅ Use GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to match your .env
    oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      'http://localhost:3000/auth/callback'
    );

    const refreshToken = process.env.REFRESH_TOKEN;
    
    if (refreshToken) {
      oauth2Client.setCredentials({
        refresh_token: refreshToken
      });
    } else {
      console.warn('⚠️ REFRESH_TOKEN not found in environment variables');
    }
  }
  return oauth2Client;
}

export function getYouTubeClient() {
  if (!youtubeClient) {
    youtubeClient = google.youtube({
      version: 'v3',
      auth: getOAuth2Client()
    });
  }
  return youtubeClient;
}