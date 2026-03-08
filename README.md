# dvyer-api

Simple API using Express and yt-dlp.

Endpoints:

/ytmp4?url=VIDEO_URL
/ytmp3?url=VIDEO_URL
/ytinfo?url=VIDEO_URL

Deploy on Render:
1. Push repo to GitHub
2. Create Web Service on Render
3. Build Command:
npm install && bash build.sh
4. Start Command:
npm start