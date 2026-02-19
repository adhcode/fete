# Testing Guide

## Prerequisites

- PostgreSQL database (configured in fete-backend/.env)
- Redis running on localhost:6379
- Cloudflare R2 bucket configured

## Step 1: Start Redis

```bash
# If not running as a service
redis-server
```

## Step 2: Setup Backend Database

```bash
cd fete-backend

# Run migrations
npx prisma migrate dev

# Seed test data (creates event with code AB3X9K)
npm run prisma:seed
```

## Step 3: Start Backend Services

```bash
# Terminal 1: API Server
cd fete-backend
npm run start:dev

# Terminal 2: Worker Process
cd fete-backend
npm run start:worker
```

Expected output:
- API: `Application is running on: http://[::1]:3000`
- Worker: `PhotoProcessor worker started`

## Step 4: Start Web App

```bash
# Terminal 3: Web App
cd fete-web
npm run dev
```

Expected output:
- `Local: http://localhost:5173/`

## Step 5: Test Upload Flow

### Via Web App (Recommended)

1. Open http://localhost:5173
2. Enter event code: `AB3X9K`
3. Click "Join Event"
4. Click "Take Photo or Choose File"
5. Select an image (JPEG or PNG, max 10MB)
6. Add optional caption
7. Click "Upload Photo"
8. Watch the upload progress
9. Photo should appear in gallery after processing (~5-10 seconds)

### Via API (Manual Testing)

```bash
# 1. Get upload intent
curl -X POST http://localhost:3000/api/upload-intent \
  -H "Content-Type: application/json" \
  -d '{
    "eventCode": "AB3X9K",
    "contentType": "image/jpeg",
    "caption": "Test photo"
  }'

# Save the photoId and uploadUrl from response

# 2. Upload file to R2
curl -X PUT "<uploadUrl>" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@/path/to/your/photo.jpg"

# 3. Complete upload
curl -X POST http://localhost:3000/api/upload-complete \
  -H "Content-Type: application/json" \
  -d '{"photoId": "<photoId>"}'

# 4. Check photos
curl http://localhost:3000/api/events/AB3X9K/photos
```

## Step 6: Monitor Processing

Watch the worker terminal for processing logs:

```
[PhotoProcessor] Processing photo abc123...
[PhotoProcessor] Successfully processed photo abc123
```

## Step 7: Verify Results

### Check Database

```bash
cd fete-backend
npx prisma studio
```

Navigate to Photo model and verify:
- Status changed from `UPLOADED` to `PROCESSED`
- `largeKey` and `thumbKey` are populated
- `width` and `height` are set

### Check Gallery

Refresh the web app gallery - your photo should appear with:
- Thumbnail in grid
- Caption (if provided)
- Hover effect showing caption

### Check R2 Storage

Photos should be stored in R2 with this structure:
```
events/
  {eventId}/
    originals/{photoId}.jpg
    large/{photoId}.jpg
    thumb/{photoId}.jpg
```

## Common Issues

### Redis Connection Failed
```
Error: connect ECONNREFUSED 127.0.0.1:6379
```
**Solution**: Start Redis with `redis-server`

### Database Connection Failed
```
Error: Can't reach database server
```
**Solution**: Check DATABASE_URL in .env, ensure PostgreSQL is running

### R2 Upload Failed
```
Error: SignatureDoesNotMatch
```
**Solution**: Verify R2 credentials in .env, regenerate API tokens if needed

### Worker Not Processing
**Symptoms**: Photos stuck in UPLOADED status
**Solution**: 
- Check worker terminal for errors
- Verify Redis connection
- Restart worker process

### Photos Not Appearing in Gallery
**Symptoms**: Upload succeeds but gallery empty
**Solution**:
- Check photo status in database (should be PROCESSED)
- Verify R2_PUBLIC_BASE_URL is correct
- Check browser console for CORS errors

### CORS Errors
```
Access to fetch blocked by CORS policy
```
**Solution**: Add CORS configuration to backend (coming soon)

## Testing Different Scenarios

### Test Rate Limiting

Upload multiple photos quickly to test per-guest limits:
```bash
# Upload 5 photos in succession
for i in {1..5}; do
  curl -X POST http://localhost:3000/api/upload-intent \
    -H "Content-Type: application/json" \
    -d "{\"eventCode\": \"AB3X9K\", \"contentType\": \"image/jpeg\", \"uploaderHash\": \"test-guest-123\"}"
done
```

### Test Approval Workflow

1. Update event to require approval:
```sql
UPDATE "Event" SET "approvalRequired" = true WHERE code = 'AB3X9K';
```

2. Upload a photo - it should be `approved: false`

3. Approve it:
```bash
curl -X PATCH http://localhost:3000/api/photos/<photoId>/approve \
  -H "Content-Type: application/json" \
  -d '{"approved": true}'
```

### Test Invalid Images

Try uploading:
- Non-image file (should fail at upload intent)
- Corrupted image (should mark as FAILED)
- Image too small (<200px) (should mark as FAILED)
- Image too large (>10MB) (should fail at upload intent)

### Test Pagination

Upload 30+ photos and test:
- Offset pagination: `?page=1&limit=20`
- Cursor pagination: `?limit=30&cursor=2026-02-19T...`

## Performance Testing

### Upload Speed
- Direct to R2: ~1-3 seconds for 2MB image
- Processing: ~3-5 seconds for typical photo
- Total time: ~5-8 seconds from upload to gallery

### Gallery Loading
- Initial load: 30 photos in ~500ms
- Infinite scroll: Smooth with cursor pagination

## Success Criteria

✅ Event loads correctly with details
✅ Camera/file picker opens on mobile/desktop
✅ Upload completes without errors
✅ Worker processes image within 10 seconds
✅ Photo appears in gallery with thumbnail
✅ Caption displays on hover
✅ Load more button works
✅ Public URLs are accessible

## Next Steps

Once basic flow works:
1. Test on mobile device (use ngrok or similar)
2. Test with various image formats (JPEG, PNG, HEIC)
3. Test with large images (8000x6000px)
4. Test concurrent uploads
5. Test network failures (disconnect during upload)

## Debugging Tips

### Enable Verbose Logging

Backend:
```typescript
// In worker/workers/photo.processor.ts
this.logger.debug(`Image metadata: ${JSON.stringify(meta)}`);
```

Frontend:
```typescript
// In lib/api.ts
console.log('API Request:', method, url, body);
console.log('API Response:', response);
```

### Check Queue Status

```bash
# Connect to Redis CLI
redis-cli

# Check queue length
LLEN bull:photo-processing:wait

# Check failed jobs
LLEN bull:photo-processing:failed
```

### Monitor Network

Open browser DevTools → Network tab:
- Check upload-intent response
- Check R2 PUT request (should be 200)
- Check upload-complete response
- Check photos GET request

## Clean Up

### Reset Database
```bash
cd fete-backend
npx prisma migrate reset
npm run prisma:seed
```

### Clear Redis Queue
```bash
redis-cli FLUSHALL
```

### Delete R2 Files
Use Cloudflare dashboard or R2 API to delete test files
