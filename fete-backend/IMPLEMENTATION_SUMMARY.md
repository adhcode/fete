# Implementation Summary

## What We Built

A complete photo upload and processing pipeline with:
- Direct-to-R2 uploads via presigned URLs
- Background processing with BullMQ workers
- Image optimization and variant generation
- Photo approval workflow
- Public gallery with pagination

## Architecture

```
Client → API → Redis Queue → Worker → R2 Storage
         ↓                      ↓
      Database ←────────────────┘
```

## Key Features

### 1. Upload Flow
- **Upload Intent**: Client requests presigned URL
- **Direct Upload**: Client uploads directly to R2 (no API bandwidth)
- **Complete Callback**: Client notifies API, job queued
- **Worker Processing**: Background job creates variants

### 2. Image Processing
- **Validation**: Format (JPEG/PNG), size (200-12000px), file size (10MB)
- **Variants**: Large (2000px) and thumb (400px)
- **Optimization**: JPEG compression, EXIF rotation, metadata stripping
- **Error Handling**: Failed images marked with FAILED status

### 3. Photo Retrieval
- **Pagination**: Both offset-based and cursor-based
- **Filtering**: By status, approval state
- **Public URLs**: Direct R2 links (via r2.dev or custom domain)
- **Approval Workflow**: Auto-approve or require manual approval

### 4. Rate Limiting
- Per-event total upload limit
- Per-guest upload limit
- Configurable per event

## API Endpoints

### Upload
- `POST /upload-intent` - Get presigned URL
- `POST /upload-complete` - Trigger processing

### Retrieval
- `GET /events/:code/photos` - List photos (paginated)
- `GET /photos/:id` - Get single photo

### Management
- `PATCH /photos/:id/approve` - Approve/reject photo

## Database Schema

### Photo Model
```prisma
model Photo {
  id           String      @id
  eventId      String
  status       PhotoStatus // PENDING_UPLOAD, UPLOADED, PROCESSED, FAILED
  approved     Boolean
  caption      String?
  originalKey  String?     // R2 key for original
  largeKey     String?     // R2 key for large variant
  thumbKey     String?     // R2 key for thumb variant
  width        Int?
  height       Int?
  uploaderHash String?     // For rate limiting
  createdAt    DateTime
}
```

### Event Model
```prisma
model Event {
  code                String  @unique
  name                String
  approvalRequired    Boolean @default(false)
  maxUploadsPerGuest  Int?
  maxUploadsTotal     Int?
  // ...
}
```

## Configuration

### Environment Variables
```bash
# Database
DATABASE_URL="postgresql://..."

# Redis (for BullMQ)
REDIS_URL="redis://localhost:6379"

# Cloudflare R2
R2_ENDPOINT="https://[account-id].r2.cloudflarestorage.com"
R2_BUCKET="fete-photos"
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_PUBLIC_BASE_URL="https://pub-[account-id].r2.dev"
```

### R2 Bucket Structure
```
events/
  {eventId}/
    originals/
      {photoId}.jpg
    large/
      {photoId}.jpg
    thumb/
      {photoId}.jpg
```

## Running the System

### Development
```bash
# Terminal 1: API Server
npm run start:dev

# Terminal 2: Worker
npm run start:worker

# Terminal 3: Redis (if not running as service)
redis-server
```

### Production
```bash
# Build
npm run build

# Run API
npm run start:prod

# Run Worker
npm run worker:prod
```

## Pagination Strategies

### Offset-based (Simple)
```bash
GET /events/SUMMER24/photos?page=1&limit=20
```
- Good for: Admin dashboards, known page counts
- Returns: Total count, page numbers

### Cursor-based (Scalable)
```bash
GET /events/SUMMER24/photos?limit=30&cursor=2026-02-18T23:15:00.000Z
```
- Good for: Infinite scroll, mobile apps
- Returns: nextCursor for next page
- More efficient for large datasets

## Approval Workflow

### Auto-approve Mode
```typescript
event.approvalRequired = false
// All uploads automatically approved
```

### Manual Approval Mode
```typescript
event.approvalRequired = true
// Uploads start as approved=false
// Guests only see approved photos
// Organizers approve via PATCH endpoint
```

## Image Validation

### Client-side (Upload Intent)
- Content type: `image/jpeg` or `image/png`
- File size: Max 10MB
- Caption: Max 140 chars

### Server-side (Worker)
- Dimensions: 200px - 12000px
- Format validation via Sharp
- Corrupt images → FAILED status

## Public URL Strategy

### Option 1: R2 Public Bucket (Current)
- Enable public access in R2 dashboard
- Use `pub-[account-id].r2.dev` domain
- Free, instant setup

### Option 2: Custom Domain (Production)
- Configure custom domain in R2
- Add to Cloudflare DNS
- Better branding, CDN benefits

### Option 3: Presigned URLs (Private)
- Keep bucket private
- Generate temporary signed URLs
- More control, but slower

## Performance Considerations

### Worker Concurrency
```typescript
concurrency: 3  // Process 3 photos simultaneously
```
- Adjust based on server resources
- Sharp is CPU-intensive

### Job Retry Strategy
```typescript
attempts: 3
backoff: { type: 'exponential', delay: 3000 }
```
- Handles transient failures
- Exponential backoff prevents thundering herd

### Database Indexes
```prisma
@@index([eventId, createdAt])
@@index([eventId, approved, createdAt])
@@index([status])
```
- Optimized for common queries
- Fast pagination

## Security Notes

### Current State (MVP)
- No authentication on endpoints
- Anyone with event code can upload
- Anyone can approve photos

### Production TODO
- Add JWT authentication
- Organizer-only approval endpoints
- Rate limiting middleware
- CORS configuration
- Input sanitization

## Monitoring & Debugging

### Worker Logs
```typescript
this.logger.log('Processing photo...')
this.logger.error('Failed to decode image...')
```

### BullMQ Dashboard (Optional)
```bash
npm install -g bull-board
# Access at http://localhost:3000/admin/queues
```

### Check Photo Status
```sql
SELECT status, COUNT(*) 
FROM "Photo" 
GROUP BY status;
```

## Next Steps

### Immediate
1. Test full flow with real images
2. Enable R2 public access
3. Verify public URLs work

### Soon
1. Add authentication (JWT)
2. Organizer dashboard
3. Batch approval
4. Photo deletion
5. Event analytics

### Future
1. Image filters/effects
2. Bulk download (ZIP)
3. Social sharing
4. Real-time updates (WebSocket)
5. CDN integration
6. Image moderation (AI)

## Troubleshooting

### Worker not processing
- Check Redis connection
- Verify REDIS_URL in .env
- Check worker logs for errors

### Public URLs not loading
- Enable R2 public access in dashboard
- Verify R2_PUBLIC_BASE_URL is correct
- Check bucket CORS settings

### Images marked FAILED
- Check worker logs for Sharp errors
- Verify image dimensions (200-12000px)
- Test with different image formats

### Rate limit not working
- Verify uploaderHash is sent
- Check event limits in database
- Test with multiple uploads
