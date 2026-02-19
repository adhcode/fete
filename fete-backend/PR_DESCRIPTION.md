# Photo Upload & Processing System

## Overview
Complete implementation of photo upload pipeline with direct-to-R2 uploads, background processing, and public gallery.

## Features Implemented

### 1. Upload Flow
- **Direct Upload to R2**: Presigned URL generation for client-side uploads
- **Background Processing**: BullMQ worker queue for async image processing
- **Image Variants**: Automatic generation of large (2000px) and thumbnail (400px) versions
- **Rate Limiting**: Per-event and per-guest upload limits

### 2. Image Processing
- **Validation**: 
  - Format: JPEG/PNG only
  - Size: 10MB max
  - Dimensions: 200px - 12000px
- **Optimization**:
  - EXIF rotation correction
  - Metadata stripping
  - JPEG compression (mozjpeg)
  - Consistent JPEG output

### 3. Photo Retrieval
- **Pagination**: Both offset-based and cursor-based
- **Filtering**: By status (PROCESSED, UPLOADED, PENDING_UPLOAD, FAILED) and approval state
- **Public URLs**: Direct R2 links via public domain
- **Approval Workflow**: Auto-approve or manual approval per event

### 4. API Endpoints

#### Upload
- `POST /api/upload-intent` - Get presigned URL for upload
- `POST /api/upload-complete` - Trigger background processing

#### Retrieval
- `GET /api/events/:code/photos` - List photos with pagination/filters
- `GET /api/photos/:id` - Get single photo details

#### Management
- `PATCH /api/photos/:id/approve` - Approve/reject photos

## Architecture

```
Client → API Server → Redis Queue → Worker Process
         ↓                            ↓
      Database ←──────────────────────┘
         ↓
    R2 Storage (originals, large, thumb)
```

## Technical Stack

- **Queue**: BullMQ with Redis
- **Image Processing**: Sharp (libvips)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Database**: PostgreSQL with Prisma

## Database Schema

### Photo Model
```prisma
model Photo {
  id           String      @id
  eventId      String
  status       PhotoStatus // PENDING_UPLOAD, UPLOADED, PROCESSED, FAILED
  approved     Boolean
  caption      String?
  originalKey  String?
  largeKey     String?
  thumbKey     String?
  width        Int?
  height       Int?
  uploaderHash String?
  createdAt    DateTime
}
```

## Configuration

### Environment Variables
```bash
REDIS_URL="redis://localhost:6379"
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
    originals/{photoId}.jpg
    large/{photoId}.jpg
    thumb/{photoId}.jpg
```

## Running the System

### Development
```bash
# Terminal 1: API Server
npm run start:dev

# Terminal 2: Worker
npm run start:worker

# Terminal 3: Redis
redis-server
```

### Production
```bash
npm run build
npm run start:prod      # API
npm run worker:prod     # Worker
```

## Testing

See `API_TESTING.md` for complete testing guide.

### Quick Test
```bash
# 1. Get upload intent
curl -X POST http://localhost:3000/api/upload-intent \
  -H "Content-Type: application/json" \
  -d '{"eventCode": "AB3X9K","contentType": "image/jpeg","caption": "Test"}'

# 2. Upload to presigned URL
curl -X PUT "<uploadUrl>" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@photo.jpg"

# 3. Complete upload
curl -X POST http://localhost:3000/api/upload-complete \
  -H "Content-Type: application/json" \
  -d '{"photoId": "<photoId>"}'

# 4. Get photos
curl http://localhost:3000/api/events/AB3X9K/photos
```

## Key Files

### Core Implementation
- `src/queue/queue.module.ts` - BullMQ setup
- `src/worker/workers/photo.processor.ts` - Image processing worker
- `src/uploads/uploads.service.ts` - Upload logic
- `src/storage/storage.service.ts` - R2 integration

### Configuration
- `src/worker.main.ts` - Worker bootstrap
- `src/worker/worker.module.ts` - Worker module

### Documentation
- `API_TESTING.md` - Complete API testing guide
- `IMPLEMENTATION_SUMMARY.md` - Detailed implementation docs

## Pagination Strategies

### Offset-based (Admin dashboards)
```bash
GET /api/events/AB3X9K/photos?page=1&limit=20
```

### Cursor-based (Infinite scroll)
```bash
GET /api/events/AB3X9K/photos?limit=30&cursor=2026-02-18T23:15:00.000Z
```

## Approval Workflow

- **Auto-approve**: `event.approvalRequired = false` (default)
- **Manual approval**: `event.approvalRequired = true`
  - Uploads start as `approved: false`
  - Guests only see approved photos
  - Organizers approve via PATCH endpoint

## Error Handling

- **Validation errors**: 400 with detailed messages
- **Failed processing**: Photos marked with FAILED status
- **Worker retries**: 3 attempts with exponential backoff
- **Dimension validation**: 200-12000px enforced

## Performance

- **Worker concurrency**: 3 simultaneous jobs
- **Database indexes**: Optimized for common queries
- **Direct uploads**: No API bandwidth usage
- **CDN-ready**: Public URLs via R2

## Security Notes

### Current (MVP)
- No authentication
- Public event codes
- Anyone can upload/approve

### Production TODO
- JWT authentication
- Organizer-only endpoints
- Rate limiting middleware
- CORS configuration
- Input sanitization

## Next Steps

1. Test with real images
2. Enable R2 public access
3. Verify credentials
4. Add authentication
5. Implement organizer dashboard

## Troubleshooting

### Worker not processing
- Check Redis connection
- Verify REDIS_URL
- Check worker logs

### Signature errors
- Verify R2 credentials
- Check bucket exists
- Regenerate API tokens if needed

### Public URLs not loading
- Enable R2 public access in Cloudflare dashboard
- Verify R2_PUBLIC_BASE_URL
