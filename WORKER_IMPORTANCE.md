# ⚠️ Worker Process - Critical Component

## Why the Worker is Essential

The **worker process** is NOT optional. It's a critical component that processes all uploaded photos and videos.

---

## What the Worker Does

### Photo Processing
1. **Receives upload** from queue
2. **Downloads** original from R2
3. **Generates large version** (max 2160px)
4. **Generates thumbnail** (400px)
5. **Uploads** processed images to R2
6. **Updates database** status to PROCESSED
7. **Removes** from queue

### Video Processing
1. **Receives upload** from queue
2. **Downloads** original from R2
3. **Transcodes** to MP4 (H.264)
4. **Generates poster** (thumbnail)
5. **Extracts metadata** (duration, dimensions)
6. **Uploads** processed video to R2
7. **Updates database** status to PROCESSED
8. **Removes** from queue

---

## Without the Worker

### What Happens
- ❌ Photos stay in `PENDING_UPLOAD` status forever
- ❌ No thumbnails generated
- ❌ No large versions created
- ❌ Videos not transcoded
- ❌ Photos don't appear in gallery
- ❌ Upload appears to "hang"
- ❌ Users think upload failed

### User Experience
```
User uploads photo
    ↓
Photo saved to R2 (original)
    ↓
Status: PENDING_UPLOAD
    ↓
[STUCK HERE - No worker to process]
    ↓
Photo never appears in gallery
```

---

## With the Worker

### What Happens
- ✅ Photos processed within seconds
- ✅ Thumbnails generated
- ✅ Large versions created
- ✅ Videos transcoded
- ✅ Photos appear in gallery
- ✅ Smooth user experience

### User Experience
```
User uploads photo
    ↓
Photo saved to R2 (original)
    ↓
Status: PENDING_UPLOAD
    ↓
Worker picks up job from queue
    ↓
Worker processes image
    ↓
Status: PROCESSED
    ↓
Photo appears in gallery ✅
```

---

## How to Start the Worker

### Option 1: Automated
```bash
./start-all.sh
```

### Option 2: Manual
```bash
cd fete-backend
npm run start:worker
```

### Verify It's Running
Look for these logs:
```
[Nest] Worker process started
[Nest] PhotoProcessor registered
[Nest] Connected to Redis
```

---

## Worker Architecture

```
┌─────────────┐
│   Backend   │
│     API     │
└──────┬──────┘
       │
       │ (adds job to queue)
       ↓
┌─────────────┐
│    Redis    │
│    Queue    │
└──────┬──────┘
       │
       │ (worker picks up job)
       ↓
┌─────────────┐
│   Worker    │
│  Process    │
└──────┬──────┘
       │
       │ (processes image/video)
       ↓
┌─────────────┐
│  R2 Storage │
└─────────────┘
```

---

## Worker Configuration

### Environment Variables
The worker uses the same `.env` file as the backend:

```env
# Required for worker
REDIS_URL="redis://localhost:6379"
R2_ENDPOINT="https://..."
R2_BUCKET="fete-photos"
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_PUBLIC_BASE_URL="https://..."
DATABASE_URL="postgresql://..."
```

### Queue Configuration
- Queue name: `photo-processing`
- Concurrency: 5 jobs at once
- Retry: 3 attempts
- Timeout: 5 minutes per job

---

## Monitoring the Worker

### Check Queue Length
```bash
redis-cli llen bull:photo-processing:wait
```

### Check Active Jobs
```bash
redis-cli llen bull:photo-processing:active
```

### Check Failed Jobs
```bash
redis-cli llen bull:photo-processing:failed
```

### View Worker Logs
Just watch the terminal where worker is running:
```
[Nest] Processing photo: photo-id-123
[Nest] Generated thumbnail: 400x300
[Nest] Generated large: 2160x1620
[Nest] Uploaded to R2
[Nest] Updated status to PROCESSED
[Nest] Job completed in 3.2s
```

---

## Common Worker Issues

### Issue: Worker crashes on startup

**Cause:** Redis not running

**Solution:**
```bash
redis-server
```

### Issue: Worker processes but photos don't appear

**Cause:** R2 credentials incorrect

**Solution:**
```bash
# Check R2 credentials
cat fete-backend/.env | grep R2

# Verify in Cloudflare dashboard
```

### Issue: Worker is slow

**Cause:** Large images or slow network

**Solution:**
- Increase concurrency in worker config
- Use faster R2 region
- Optimize image sizes

### Issue: Jobs stuck in queue

**Cause:** Worker not running or crashed

**Solution:**
```bash
# Restart worker
cd fete-backend
npm run start:worker
```

---

## Worker Performance

### Typical Processing Times
- **Small photo** (< 2MB): 1-2 seconds
- **Large photo** (5-10MB): 3-5 seconds
- **Video** (< 50MB): 10-30 seconds
- **Large video** (> 100MB): 1-2 minutes

### Optimization Tips
1. Use Sharp for fast image processing
2. Process multiple jobs concurrently
3. Use R2 in same region as server
4. Implement job prioritization
5. Add job progress tracking

---

## Production Deployment

### Deploy Worker Separately

The worker should be deployed as a **separate process** from the API:

**Option 1: Same Server**
```bash
# Start API
npm run start:prod

# Start Worker (separate process)
npm run worker:prod
```

**Option 2: Separate Server**
```bash
# Server 1: API only
npm run start:prod

# Server 2: Worker only
npm run worker:prod
```

**Option 3: Container**
```dockerfile
# Dockerfile.worker
FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
CMD ["npm", "run", "worker:prod"]
```

### Scaling Workers

You can run **multiple worker instances** for better performance:

```bash
# Terminal 1
npm run worker:prod

# Terminal 2
npm run worker:prod

# Terminal 3
npm run worker:prod
```

All workers will share the same Redis queue and process jobs in parallel.

---

## Summary

### Critical Points

1. ⚠️ **Worker is REQUIRED** - not optional
2. ⚠️ **Must run separately** from API
3. ⚠️ **Needs Redis** to be running first
4. ⚠️ **Uses same .env** as backend
5. ⚠️ **Processes ALL uploads** - photos and videos

### Quick Start

```bash
# Terminal 1
redis-server

# Terminal 2
cd fete-backend && npm run start:dev

# Terminal 3 - DON'T FORGET THIS!
cd fete-backend && npm run start:worker

# Terminal 4
cd fete-web && npm run dev
```

### Verification

```bash
# Check worker is running
ps aux | grep "worker.main"

# Check queue
redis-cli llen bull:photo-processing:wait

# Upload a photo and watch worker logs
# Should see processing messages
```

---

## Remember

🚨 **No Worker = No Photos in Gallery**

Always start the worker process!
