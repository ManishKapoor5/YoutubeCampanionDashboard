// src/utils/getNewToken.ts
import 'dotenv/config';
import { google } from 'googleapis';
import * as http from 'http';
import * as url from 'url';

async function getNewToken() {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'http://localhost:3000/auth/callback'
  );

  const SCOPES = [
    'https://www.googleapis.com/auth/youtube.force-ssl',
    'https://www.googleapis.com/auth/youtube.readonly'
  ];

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
    prompt: 'consent'
  });

  console.log('\n🔗 Open this URL in your browser:\n');
  console.log(authUrl);
  console.log('\n⏳ Waiting for authorization...\n');

  const server = http.createServer(async (req, res) => {
    if (req.url?.startsWith('/auth/callback')) {
      const parsedUrl = url.parse(req.url, true);
      const code = parsedUrl.query.code as string;

      if (code) {
        try {
          const { tokens } = await oauth2Client.getToken(code);
          
          console.log('\n✅ SUCCESS!\n');
          console.log('================================');
          console.log('Add this to your .env file:\n');
          console.log(`REFRESH_TOKEN=${tokens.refresh_token}`);
          console.log('================================\n');

          res.writeHead(200, { 'Content-Type': 'text/html' });
          res.end(`
            <html>
              <body style="font-family: Arial; text-align: center; padding: 50px;">
                <h1>✅ Success!</h1>
                <p>Check your terminal for the new refresh token.</p>
                <p>You can close this window.</p>
              </body>
            </html>
          `);
          
          setTimeout(() => {
            server.close();
            process.exit(0);
          }, 1000);
        } catch (error) {
          console.error('Error:', error);
          res.writeHead(500);
          res.end('Error getting token');
        }
      }
    }
  });

  server.listen(3000, () => {
    console.log('Server listening on port 3000...');
  });
}

getNewToken();