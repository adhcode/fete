# Video Upload Implementation

## Overview
This implementation adds video upload support with high-quality transcoding to create a Snapchat-style story feed experience.

## Database Changes

### Migration Steps

```bash
# 1. Create migration
cd fete-backend
npx prisma migrate dev --name add_video_support

# 2. Apply migration
npx prisma migrate deploy
```

### Schema Changes

**New Enum:**
```prisma
enum MediaType {
  IMAGE
  VIDEO
}
```

**Photo Model Updates:**
- `mediaType`: MediaType (default IMAGE)
- `mimeType`: String?
- `playbackKey`: String? (processed MP4 for videos)
- `posterKey`: String? (thumbnail JPG for videos)
- `durationSec`: Int? (video duration in seconds)

## R2 Storage Structure

```
events/
  {eventId}/
    originals/
      {id}.mp4      # Original video upload
      {id}.jpg      # Original image upload
    video/
      {id}.mp4      # Processed video (H.264, max 1080p, 30fps)
    poster/
      {id}.jpg      # Video poster frame
    large/
      {id}.jpg      # Large image variant
    thumb/
      {id}.jpg      # Thumbnail image variant
```

## Video Processing Specs

### Transcoding Settings
- **Codec**: H.264 (libx264)
- **Profile**: High, Level 4.0
- **Resolution**: Max 1080p (1920x1080), preserves aspect ratio
- **Frame Rate**: Capped at 30fps
- **Bitrate**: 
  - Target: 5 Mbps
  - Max: 6.5 Mbps
  - Buffer: 11 Mbps
- **Audio**: AAC, 128kbps, 44.1kHz
- **Format**: MP4 with faststart enabled

### Validation Rules
- **Max Duration**: 15 seconds
- **Max File Size**: 40MB
- **Supported Format**: MP4 only (MVP)
- **Min Dimensions**: 200x200px
- **Max Dimensions**: 12000x12000px

### Poster Frame
- Generated at 1 second into processed video
- JPEG format
- Same resolution as processed video
- Quality: 2 (high quality)

## API Changes

### Upload Intent
```typescript
POST /api/upload-intent
{
  "eventCode": "AB3X9K",
  "mediaType": "VIDEO",  // or "IMAGE"
  "contentType": "video/mp4",
  "fileSizeBytes": 5242880,
  "caption": "Amazing moment!",
  "uploaderHash": "guest123"
}

Response:
{
  "photoId": "abc123...",
  "uploadUrl": "https://..."
}
```

### Story Endpoint
```typescript
GET /api/events/:code/story?limit=30&cursor=2026-02-19T...

Response:
{
  "data": [
    {
      "id": "abc123",
      "mediaType": "VIDEO",
      "playbackUrl": "https://pub-xxx.r2.dev/events/.../video/abc123.mp4",
      "posterUrl": "https://pub-xxx.r2.dev/events/.../poster/abc123.jpg",
      "durationSec": 12,
      "width": 1080,
      "height": 1920,
      "caption": "Amazing moment!",
      "createdAt": "2026-02-19T..."
    },
    {
      "id": "def456",
      "mediaType": "IMAGE",
      "largeUrl": "https://pub-xxx.r2.dev/events/.../large/def456.jpg",
      "thumbUrl": "https://pub-xxx.r2.dev/events/.../thumb/def456.jpg",
      "width": 2000,
      "height": 1500,
      "caption": "Beautiful sunset",
      "createdAt": "2026-02-19T..."
    }
  ],
  "nextCursor": "2026-02-19T12:00:00.000Z"
}
```

### Media Approval
```typescript
PATCH /api/media/:id/approve
{
  "approved": true
}
```

## Worker Processing

### Image Processing (Unchanged)
1. Download original from R2
2. Validate dimensions (200-12000px)
3. Create large variant (max 2000px)
4. Create thumb variant (max 400px)
5. Upload variants to R2
6. Update DB with PROCESSED status

### Video Processing (New)
1. Download original from R2
2. Probe video metadata (ffprobe)
3. Validate duration (max 15s)
4. Transcode to H.264 MP4:
   - Max 1080p resolution
   - 30fps cap
   - 5-6.5 Mbps bitrate
   - AAC audio
5. Generate poster frame at 1s
6. Upload processed video + poster to R2
7. Update DB with PROCESSED status
8. Cleanup temp files

### Error Handling
- Duration > 15s → FAILED status
- File size > 40MB → FAILED status
- ffmpeg errors → FAILED status
- Invalid format → FAILED status

## Frontend Changes

### Upload Component
- Accepts both images and videos
- File input: `accept="image/*,video/mp4"`
- Validates file type and size
- Shows video preview with controls
- Displays "Video (max 15s)" indicator

### Story Viewer
- Full-screen vertical viewer
- Swipe/tap navigation
- Auto-advances after duration
- Images: 5 second display
- Videos: Auto-play with actual duration
- Progress bars at top
- Tap left: previous
- Tap right: next
- Tap center: pause/play video

### Gallery
- Shows video poster thumbnails
- Play icon overlay for videos
- Mixed image/video grid

## Deployment

### Worker Dockerfile
```dockerfile
FROM node:20-alpine

# Install ffmpeg
RUN apk add --no-cache ffmpeg

WORKDIR /app
COPY . .
RUN npm ci && npm run build

CMD ["node", "dist/worker.main.js"]
```

### Railway Deployment
```bash
# Build worker with ffmpeg
docker build -f Dockerfile.worker -t fete-worker .

# Deploy to Railway
railway up
```

### Environment Variables
No new environment variables required. Uses existing:
- `DATABASE_URL`
- `REDIS_URL`
- `R2_*` variables

## Testing

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

# 2. Upload video to R2
curl -X PUT "<uploadUrl>" \
  -H "Content-Type: video/mp4" \
  --data-binary "@test-video.mp4"

# 3. Complete upload
curl -X POST http://localhost:3000/api/upload-complete \
  -H "Content-Type: application/json" \
  -d '{"photoId": "<photoId>"}'

# 4. Check story
curl http://localhost:3000/api/events/AB3X9K/story
```

### Verify Processing
```bash
# Check worker logs
npm run start:worker

# Expected output:
# [VideoTranscodeService] Video metadata: 1080x1920, 12s
# [VideoTranscodeService] Running ffmpeg: ...
# [VideoTranscodeService] Video transcoding completed
# [VideoTranscodeService] Poster frame generated
# [PhotoProcessor] Successfully processed video abc123
```

### Check Database
```sql
SELECT id, mediaType, status, playbackKey, posterKey, durationSec 
FROM "Photo" 
WHERE mediaType = 'VIDEO';
```

## Performance

### Processing Times
- Video probe: ~100ms
- Transcode (10s video): ~5-15s
- Poster generation: ~500ms
- Upload to R2: ~1-2s
- **Total**: ~7-20s per video

### Optimization Tips
- Worker concurrency: 3 (CPU-intensive)
- Temp file cleanup: Automatic
- Idempotency: Skip if already processed
- Retry logic: 3 attempts with exponential backoff

## Troubleshooting

### ffmpeg not found
```bash
# macOS
brew install ffmpeg

# Linux/Alpine
apk add ffmpeg

# Ubuntu
apt-get install ffmpeg
```

### Video processing fails
- Check ffmpeg version: `ffmpeg -version`
- Check video format: `ffprobe video.mp4`
- Verify duration < 15s
- Check file size < 40MB
- Review worker logs for errors

### Videos not playing
- Verify R2_PUBLIC_BASE_URL is set
- Check R2 bucket has public access
- Verify CORS settings on R2
- Check browser console for errors

## Future Enhancements

### Short Term
- [ ] Support more video formats (MOV, AVI)
- [ ] Adjustable duration limit per event
- [ ] Video compression quality settings
- [ ] Batch video processing

### Long Term
- [ ] Video filters/effects
- [ ] Trim video before upload
- [ ] Multiple poster frame options
- [ ] Video analytics (views, completion rate)
- [ ] HLS streaming for longer videos
- [ ] CDN integration

## Security Considerations

### Current
- File size validation (40MB)
- Duration validation (15s)
- Format validation (MP4 only)
- Rate limiting per event/guest

### Production TODO
- [ ] Content moderation (AI)
- [ ] Watermarking
- [ ] DRM for premium content
- [ ] Signed URLs for private videos
- [ ] Abuse detection

## Cost Estimates

### R2 Storage
- Original video (10s, 5MB): $0.015/GB/month
- Processed video (10s, 3MB): $0.015/GB/month
- Poster (100KB): Negligible
- **Total per video**: ~$0.00012/month

### Processing
- Worker CPU time: ~10-15s per video
- Railway: ~$0.000001 per second
- **Total per video**: ~$0.00001

### Bandwidth
- Upload (direct to R2): Free
- Download (R2 egress): $0.36/GB
- **Per view**: ~$0.001 (3MB video)

## Monitoring

### Key Metrics
- Video processing success rate
- Average processing time
- Failed video count
- Storage usage
- Bandwidth usage

### Alerts
- Processing failures > 5%
- Average processing time > 30s
- Storage > 80% quota
- Bandwidth > budget

## Documentation Updates

- [x] API_TESTING.md - Add video endpoints
- [x] IMPLEMENTATION_SUMMARY.md - Add video processing
- [x] README.md - Update features list
- [ ] User guide - Add video upload instructions
- [ ] Admin guide - Add video moderation guide
