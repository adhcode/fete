# Video Feature - Quick Start

## Setup (One Time)

```bash
# 1. Run setup script
cd fete-backend
chmod +x setup-video.sh
./setup-video.sh

# This will:
# - Install ffmpeg (if needed)
# - Run database migration
# - Generate Prisma client
```

## Start Services

```bash
# Terminal 1: API Server
cd fete-backend
npm run start:dev

# Terminal 2: Worker (with video processing)
cd fete-backend
npm run start:worker

# Terminal 3: Web App
cd fete-web
npm run dev
```

## Test Video Upload

1. Visit: http://localhost:5173/e/AB3X9K
2. Click "Take Photo or Video"
3. Select a short MP4 video (max 15s, 40MB)
4. Add optional caption
5. Click "Upload"
6. Watch worker logs for processing (~10-15s)
7. Video appears in Story section at top
8. Click "View All" to open story viewer

## Story Viewer Controls

- **Tap Left**: Previous media
- **Tap Right**: Next media
- **Tap Center**: Pause/play video
- **X Button**: Close viewer
- **Progress Bars**: Show position in story

## API Testing

### Upload Video
```bash
# 1. Get upload intent
curl -X POST http://localhost:3000/api/upload-intent \
  -H "Content-Type: application/json" \
  -d '{
    "eventCode": "AB3X9K",
    "mediaType": "VIDEO",
    "contentType": "video/mp4",
    "caption": "Test video"
  }'

# 2. Upload to R2 (use uploadUrl from response)
curl -X PUT "<uploadUrl>" \
  -H "Content-Type: video/mp4" \
  --data-binary "@test.mp4"

# 3. Complete upload
curl -X POST http://localhost:3000/api/upload-complete \
  -H "Content-Type: application/json" \
  -d '{"photoId": "<photoId>"}'
```

### Get Story Feed
```bash
curl http://localhost:3000/api/events/AB3X9K/story
```

### Get Mixed Gallery
```bash
# All media
curl http://localhost:3000/api/events/AB3X9K/photos

# Only videos
curl http://localhost:3000/api/events/AB3X9K/photos?mediaType=VIDEO

# Only images
curl http://localhost:3000/api/events/AB3X9K/photos?mediaType=IMAGE
```

## Verify Processing

### Check Worker Logs
```
[VideoTranscodeService] Video metadata: 1080x1920, 12s
[VideoTranscodeService] Running ffmpeg: ...
[VideoTranscodeService] Video transcoding completed
[VideoTranscodeService] Poster frame generated
[PhotoProcessor] Successfully processed video abc123
```

### Check Database
```bash
cd fete-backend
npx prisma studio

# Navigate to Photo table
# Filter by mediaType = VIDEO
# Verify playbackKey and posterKey are populated
```

### Check R2 Storage
Videos should appear in:
- `events/{eventId}/originals/{id}.mp4` - Original
- `events/{eventId}/video/{id}.mp4` - Processed
- `events/{eventId}/poster/{id}.jpg` - Thumbnail

## Video Specs

### Upload Limits
- **Format**: MP4 only
- **Max Duration**: 15 seconds
- **Max File Size**: 40MB
- **Min Dimensions**: 200x200px
- **Max Dimensions**: 12000x12000px

### Processing Output
- **Codec**: H.264 (libx264)
- **Resolution**: Max 1080p (preserves aspect ratio)
- **Frame Rate**: Max 30fps
- **Bitrate**: 5-6.5 Mbps
- **Audio**: AAC, 128kbps
- **Format**: MP4 with faststart

## Troubleshooting

### ffmpeg not found
```bash
# macOS
brew install ffmpeg

# Linux
sudo apt-get install ffmpeg

# Check installation
ffmpeg -version
```

### Video stuck in UPLOADED status
- Check worker is running
- Check worker logs for errors
- Verify ffmpeg is installed
- Check video duration < 15s
- Check file size < 40MB

### Videos not playing in browser
- Check R2_PUBLIC_BASE_URL in .env
- Verify R2 bucket has public access
- Check browser console for CORS errors
- Try different browser

### Processing fails
```bash
# Check video format
ffprobe your-video.mp4

# Test ffmpeg manually
ffmpeg -i your-video.mp4 -c:v libx264 -preset medium test-output.mp4
```

## Features

### ✅ Implemented
- Video upload (MP4)
- High-quality transcoding
- Poster frame generation
- Story feed viewer
- Mixed image/video gallery
- Auto-play with progress
- Swipe/tap navigation
- Duration validation
- File size validation

### 🚧 Coming Soon
- Support for MOV, AVI formats
- Video trimming
- Adjustable duration limits
- Video filters/effects
- Batch processing

## Performance

### Expected Times
- Upload: 1-3 seconds
- Processing: 5-15 seconds (depends on video length)
- Total: 7-20 seconds from upload to story

### Optimization
- Worker processes 3 videos concurrently
- Automatic temp file cleanup
- Idempotent processing (skip if already done)
- Retry logic (3 attempts)

## Next Steps

1. ✅ Setup complete
2. ✅ Test video upload
3. ✅ Verify story viewer
4. 🔲 Deploy to production
5. 🔲 Add authentication
6. 🔲 Enable content moderation

## Support

- Full docs: `VIDEO_IMPLEMENTATION.md`
- API docs: `fete-backend/API_TESTING.md`
- Architecture: `ARCHITECTURE.md`
