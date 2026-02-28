# Video Upload + Story Feed Feature

## 🎥 Overview
Adds high-quality video upload support with a Snapchat-style story feed. Videos are transcoded to consistent quality (H.264, max 1080p, 30fps) for premium playback experience.

## ✨ Key Features

### Video Upload
- MP4 video support (max 15s, 40MB)
- Direct-to-R2 upload (no backend bandwidth)
- Automatic transcoding to H.264
- Poster frame generation
- Same approval workflow as images

### Story Feed
- Full-screen vertical viewer
- Mixed images + videos
- Auto-advance with progress bars
- Swipe/tap navigation
- Video auto-play with poster
- Smooth transitions

### Quality First
- Consistent 1080p max resolution
- 30fps cap for smooth playback
- 5-6.5 Mbps bitrate
- H.264 codec for compatibility
- AAC audio (128kbps)
- Faststart enabled for web

## 🗄️ Database Changes

### New Enum
```prisma
enum MediaType {
  IMAGE
  VIDEO
}
```

### Photo Model Extensions
- `mediaType`: MediaType (default IMAGE)
- `mimeType`: String?
- `playbackKey`: String? (processed MP4)
- `posterKey`: String? (thumbnail JPG)
- `durationSec`: Int? (video duration)

### Migration
```bash
cd fete-backend
npx prisma migrate dev --name add_video_support
```

## 📁 File Structure

### Backend
```
fete-backend/
├── src/
│   ├── worker/
│   │   ├── services/
│   │   │   └── video-transcode.service.ts  # NEW: ffmpeg wrapper
│   │   └── workers/
│   │       └── photo.processor.ts          # UPDATED: handles videos
│   └── uploads/
│       ├── dto.ts                          # UPDATED: video support
│       ├── uploads.service.ts              # UPDATED: story endpoint
│       └── uploads.controller.ts           # UPDATED: story route
├── Dockerfile.worker                       # NEW: with ffmpeg
├── setup-video.sh                          # NEW: setup script
└── VIDEO_IMPLEMENTATION.md                 # NEW: documentation
```

### Frontend
```
fete-web/
├── src/
│   ├── components/
│   │   ├── StoryViewer.tsx                 # NEW: story viewer
│   │   ├── UploadSection.tsx               # UPDATED: video upload
│   │   └── Gallery.tsx                     # UPDATED: video thumbnails
│   ├── pages/
│   │   └── EventPage.tsx                   # UPDATED: story integration
│   ├── types/
│   │   └── index.ts                        # UPDATED: video types
│   └── lib/
│       └── api.ts                          # UPDATED: story API
```

## 🔧 Technical Implementation

### Video Processing Pipeline
```
1. Upload original MP4 → R2
2. Worker downloads original
3. ffprobe extracts metadata
4. Validate duration (≤15s)
5. Transcode with ffmpeg:
   - H.264 video codec
   - Max 1080p, 30fps
   - 5-6.5 Mbps bitrate
   - AAC audio
6. Generate poster at 1s
7. Upload processed files → R2
8. Update DB → PROCESSED
9. Cleanup temp files
```

### R2 Storage Structure
```
events/{eventId}/
  originals/{id}.mp4    # Original upload
  video/{id}.mp4        # Processed video
  poster/{id}.jpg       # Video thumbnail
  large/{id}.jpg        # Image variants
  thumb/{id}.jpg
```

### API Endpoints

**Upload Intent (Extended)**
```typescript
POST /api/upload-intent
{
  "eventCode": "AB3X9K",
  "mediaType": "VIDEO",
  "contentType": "video/mp4",
  "fileSizeBytes": 5242880,
  "caption": "Amazing!"
}
```

**Story Feed (New)**
```typescript
GET /api/events/:code/story?limit=30&cursor=...

Response: {
  "data": [
    {
      "id": "abc",
      "mediaType": "VIDEO",
      "playbackUrl": "https://...",
      "posterUrl": "https://...",
      "durationSec": 12,
      "width": 1080,
      "height": 1920
    }
  ],
  "nextCursor": "..."
}
```

**Media Approval (New)**
```typescript
PATCH /api/media/:id/approve
{ "approved": true }
```

## 🎨 Frontend Features

### Upload Section
- File input accepts `image/*,video/mp4`
- Video preview with controls
- Shows "Video (max 15s)" indicator
- Validates file size (40MB for video, 10MB for image)

### Story Viewer
- Full-screen overlay
- Progress bars for each media item
- Tap left/right to navigate
- Tap center to pause/play video
- Auto-advance after duration
- Smooth transitions
- Caption overlay

### Gallery
- Video thumbnails show poster
- Play icon overlay
- Mixed grid with images

## 🚀 Deployment

### Worker with ffmpeg
```dockerfile
FROM node:20-alpine
RUN apk add --no-cache ffmpeg
WORKDIR /app
COPY . .
RUN npm ci && npm run build
CMD ["node", "dist/worker.main.js"]
```

### Railway
```bash
# Build and deploy worker
docker build -f Dockerfile.worker -t fete-worker .
railway up
```

## 📊 Performance

### Processing Times
- Video probe: ~100ms
- Transcode (10s): ~5-15s
- Poster gen: ~500ms
- Upload: ~1-2s
- **Total**: ~7-20s

### Storage per Video
- Original (5MB): $0.000075/month
- Processed (3MB): $0.000045/month
- Poster (100KB): Negligible
- **Total**: ~$0.00012/month

### Bandwidth
- Upload: Free (direct to R2)
- Download: $0.36/GB
- Per view: ~$0.001 (3MB)

## ✅ Validation

### Upload Validation
- Max duration: 15 seconds
- Max file size: 40MB
- Format: MP4 only (MVP)
- Min dimensions: 200x200px
- Max dimensions: 12000x12000px

### Processing Validation
- ffmpeg decode check
- Duration verification
- Format validation
- Error handling with FAILED status

## 🧪 Testing

### Manual Test Flow
```bash
# 1. Setup
cd fete-backend
chmod +x setup-video.sh
./setup-video.sh

# 2. Start services
npm run start:dev      # Terminal 1
npm run start:worker   # Terminal 2

# 3. Test upload
# Visit http://localhost:5173/e/AB3X9K
# Upload a short MP4 video
# Watch it process in worker logs
# View in story feed

# 4. Verify
curl http://localhost:3000/api/events/AB3X9K/story
```

### Database Check
```sql
SELECT id, mediaType, status, playbackKey, posterKey, durationSec 
FROM "Photo" 
WHERE mediaType = 'VIDEO';
```

## 🔒 Security

### Current
- File size limits (40MB)
- Duration limits (15s)
- Format validation (MP4)
- Rate limiting per event/guest

### Production TODO
- [ ] Content moderation (AI)
- [ ] Watermarking
- [ ] Signed URLs for private videos
- [ ] Abuse detection

## 📈 Monitoring

### Key Metrics
- Video processing success rate
- Average processing time
- Failed video count
- Storage usage
- Bandwidth usage

### Alerts
- Processing failures > 5%
- Avg processing time > 30s
- Storage > 80% quota

## 🐛 Troubleshooting

### ffmpeg not found
```bash
# macOS
brew install ffmpeg

# Linux
apt-get install ffmpeg

# Alpine
apk add ffmpeg
```

### Videos not playing
- Check R2_PUBLIC_BASE_URL
- Verify R2 public access
- Check CORS settings
- Review browser console

### Processing fails
- Check ffmpeg version
- Verify video format
- Check duration < 15s
- Review worker logs

## 📝 Documentation

- [x] VIDEO_IMPLEMENTATION.md - Complete guide
- [x] setup-video.sh - Setup script
- [x] Dockerfile.worker - Worker with ffmpeg
- [x] API documentation updates
- [x] Frontend component docs

## 🎯 Future Enhancements

### Short Term
- [ ] Support MOV, AVI formats
- [ ] Adjustable duration per event
- [ ] Quality settings
- [ ] Batch processing

### Long Term
- [ ] Video filters/effects
- [ ] Trim before upload
- [ ] Multiple poster options
- [ ] HLS streaming
- [ ] CDN integration

## 🔄 Migration Path

### From Current Version
1. Run `./setup-video.sh`
2. Restart API and worker
3. No data migration needed
4. Existing images unaffected

### Rollback
```bash
# Revert migration
npx prisma migrate resolve --rolled-back add_video_support

# Restart services
npm run start:dev
npm run start:worker
```

## ✅ Checklist

- [x] Database schema updated
- [x] Prisma migration created
- [x] Video transcode service
- [x] Worker processing logic
- [x] Upload API extended
- [x] Story API endpoint
- [x] Frontend upload UI
- [x] Story viewer component
- [x] Gallery video support
- [x] Worker Dockerfile
- [x] Setup script
- [x] Documentation
- [ ] E2E tests
- [ ] Load testing
- [ ] Production deployment

## 📦 Dependencies

### Backend
- ffmpeg (system dependency)
- Existing: sharp, bullmq, prisma

### Frontend
- No new dependencies
- Uses native HTML5 video

## 🎬 Demo

### Story Feed
- Full-screen vertical viewer
- Auto-play videos with sound
- Smooth transitions
- Progress indicators
- Swipe navigation

### Upload Flow
1. Select video from camera/gallery
2. Preview with controls
3. Add caption
4. Upload (direct to R2)
5. Processing (~10s)
6. Appears in story feed

---

**Breaking Changes**: None

**Migration Required**: Yes (database schema)

**Deployment Notes**: Worker needs ffmpeg installed
