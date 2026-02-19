# Video Upload Troubleshooting

## Issue: ffmpeg Installation Locked

If you see "A `brew install ffmpeg` process has already locked", you need to:

### Option 1: Wait for brew to finish
```bash
# Check if brew is still running
ps aux | grep brew

# Wait for it to complete, then verify
which ffmpeg
ffmpeg -version
```

### Option 2: Cancel and reinstall
```bash
# Kill the locked brew process
pkill -9 brew

# Clean up brew locks
rm -rf /Users/MAC/Library/Caches/Homebrew/downloads/*.incomplete

# Try installing again
brew install ffmpeg

# Verify installation
ffmpeg -version
```

### Option 3: Manual ffmpeg installation
```bash
# Download pre-built binary
# Visit: https://evermeet.cx/ffmpeg/
# Or use this direct link:
curl -O https://evermeet.cx/ffmpeg/getrelease/ffmpeg/zip

# Extract and move to PATH
unzip ffmpeg.zip
sudo mv ffmpeg /usr/local/bin/
sudo chmod +x /usr/local/bin/ffmpeg

# Verify
ffmpeg -version
```

## Issue: Video Not Showing After Upload

### Step 1: Check if migration ran
```bash
cd fete-backend
npx prisma migrate status

# If migration is pending, run:
npx prisma migrate deploy

# Then regenerate client:
npx prisma generate
```

### Step 2: Check database
```bash
cd fete-backend
npx prisma studio

# In Prisma Studio:
# 1. Open Photo table
# 2. Look for your uploaded video
# 3. Check these fields:
#    - mediaType: should be "VIDEO"
#    - status: should be "PROCESSED" (if worker ran)
#    - playbackKey: should have a value like "events/.../video/xxx.mp4"
#    - posterKey: should have a value like "events/.../poster/xxx.jpg"
```

### Step 3: Check worker logs
```bash
# Look for errors in worker terminal
# You should see:
# [VideoTranscodeService] Video metadata: ...
# [VideoTranscodeService] Running ffmpeg: ...
# [PhotoProcessor] Successfully processed video ...

# If you see errors like "ffmpeg: command not found":
# - ffmpeg is not installed or not in PATH
# - Restart terminal after installing ffmpeg
# - Run: source ~/.zshrc
```

### Step 4: Check video status in database
```sql
-- Run this in Prisma Studio or psql
SELECT id, mediaType, status, playbackKey, posterKey, durationSec 
FROM "Photo" 
WHERE mediaType = 'VIDEO' 
ORDER BY "createdAt" DESC 
LIMIT 5;
```

### Step 5: Restart services after ffmpeg install
```bash
# After ffmpeg is installed, restart worker
# Terminal 1: Stop worker (Ctrl+C)
cd fete-backend
npm run start:worker

# Terminal 2: API should still be running
# Terminal 3: Web app should still be running
```

## Common Issues

### 1. Video stuck in UPLOADED status
**Cause**: Worker can't process because ffmpeg not installed

**Solution**:
```bash
# Install ffmpeg
brew install ffmpeg

# Restart worker
cd fete-backend
npm run start:worker

# The worker will automatically retry failed jobs
```

### 2. Video shows FAILED status
**Cause**: Video validation failed

**Check**:
- Duration > 15 seconds?
- File size > 40MB?
- Format not MP4?
- Corrupted video file?

**Solution**:
```bash
# Check video properties
ffprobe your-video.mp4

# Look for:
# - Duration: should be ≤ 15s
# - Format: should be mp4
# - Size: should be ≤ 40MB
```

### 3. Video uploaded but not in story feed
**Cause**: Approval required or not PROCESSED

**Check**:
```bash
# Check event settings
curl http://localhost:3000/events/AB3X9K

# If approvalRequired: true, approve the video:
curl -X PATCH http://localhost:3000/api/media/<videoId>/approve \
  -H "Content-Type: application/json" \
  -d '{"approved": true}'
```

### 4. Story feed returns empty
**Cause**: No PROCESSED videos with approved=true

**Solution**:
```bash
# Check what's in the database
curl http://localhost:3000/api/events/AB3X9K/photos?mediaType=VIDEO

# If videos exist but not in story:
# - Check status is PROCESSED
# - Check approved is true
# - Check event.approvalRequired setting
```

## Manual Video Processing Test

If worker is having issues, test ffmpeg manually:

```bash
# 1. Download a test video from R2
# (Get the originalKey from database)

# 2. Test ffmpeg transcode
ffmpeg -i input.mp4 \
  -c:v libx264 \
  -preset medium \
  -profile:v high \
  -level 4.0 \
  -vf "scale=w=min(1920\,iw):h=min(1080\,ih):force_original_aspect_ratio=decrease,fps=fps=30" \
  -b:v 5M \
  -maxrate 6.5M \
  -bufsize 11M \
  -c:a aac \
  -b:a 128k \
  -ar 44100 \
  -movflags +faststart \
  -pix_fmt yuv420p \
  -y output.mp4

# 3. Generate poster
ffmpeg -i output.mp4 \
  -ss 00:00:01.000 \
  -vframes 1 \
  -vf "scale=w=min(1920\,iw):h=min(1080\,ih):force_original_aspect_ratio=decrease" \
  -q:v 2 \
  -y poster.jpg

# If these work, ffmpeg is installed correctly
```

## Complete Reset

If nothing works, do a complete reset:

```bash
# 1. Stop all services (Ctrl+C in all terminals)

# 2. Install ffmpeg
brew install ffmpeg
ffmpeg -version

# 3. Reset database
cd fete-backend
npx prisma migrate reset
npm run prisma:seed

# 4. Regenerate Prisma client
npx prisma generate

# 5. Restart services
# Terminal 1
npm run start:dev

# Terminal 2
npm run start:worker

# Terminal 3
cd ../fete-web
npm run dev

# 6. Try uploading again
```

## Verify Everything Works

```bash
# 1. Check ffmpeg
ffmpeg -version
# Should show version info

# 2. Check migration
cd fete-backend
npx prisma migrate status
# Should show "Database schema is up to date!"

# 3. Check API
curl http://localhost:3000/events/AB3X9K
# Should return event data

# 4. Check story endpoint
curl http://localhost:3000/api/events/AB3X9K/story
# Should return {"data": [], "nextCursor": null} if no videos yet

# 5. Upload test video via web app
# Visit http://localhost:5173/e/AB3X9K
# Upload a short MP4
# Watch worker logs for processing

# 6. Check story again
curl http://localhost:3000/api/events/AB3X9K/story
# Should return your video with playbackUrl and posterUrl
```

## Get Help

If still not working, provide:
1. Worker logs (full output)
2. Database screenshot (Photo table)
3. API response from `/api/events/AB3X9K/story`
4. Browser console errors (F12)
5. ffmpeg version: `ffmpeg -version`
6. Migration status: `npx prisma migrate status`
