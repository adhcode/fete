# API Testing Guide

## New Features Added

1. ✅ Image validation (file size, format)
2. ✅ GET endpoints to retrieve photos
3. ✅ Photo approval workflow
4. ✅ Public URLs for serving photos
5. ✅ Pagination for photo lists

## Endpoints

### 1. Upload Intent (with validation)
```bash
POST http://localhost:3000/api/upload-intent
Content-Type: application/json

{
  "eventCode": "SUMMER24",
  "contentType": "image/jpeg",
  "fileSizeBytes": 2048000,  # Optional: 2MB
  "caption": "Beautiful sunset",
  "uploaderHash": "guest123"
}

# Response:
{
  "photoId": "abc123...",
  "uploadUrl": "https://..."
}
```

**Validation:**
- Only `image/jpeg` and `image/png` allowed
- Max file size: 10MB
- Caption max: 140 chars

### 2. Complete Upload
```bash
POST http://localhost:3000/api/upload-complete
Content-Type: application/json

{
  "photoId": "abc123..."
}

# Response:
{
  "success": true,
  "photoId": "abc123..."
}
```

### 3. Get Event Photos (with pagination)

**Offset-based pagination (default):**
```bash
GET http://localhost:3000/api/events/SUMMER24/photos?page=1&limit=20

# Response:
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
```

**Cursor-based pagination (recommended for infinite scroll):**
```bash
# First load
GET http://localhost:3000/api/events/SUMMER24/photos?limit=30

# Next page (use nextCursor from previous response)
GET http://localhost:3000/api/events/SUMMER24/photos?limit=30&cursor=2026-02-18T23:15:00.000Z

# Response:
{
  "data": [...],
  "nextCursor": "2026-02-18T22:45:00.000Z"  # null if no more items
}
```

**Query params:**
- `page`: Offset pagination (default 1)
- `limit`: Items per page (default 20, max 100)
- `cursor`: ISO date string for cursor-based pagination
- `status`: `PROCESSED` | `UPLOADED` | `PENDING_UPLOAD` | `FAILED`
- `approved`: `true` | `false`

**Approval behavior:**
- If event has `approvalRequired: true`, guests only see `approved: true` photos
- Organizers can pass `approved=false` to see pending photos

### 4. Get Single Photo
```bash
GET http://localhost:3000/api/photos/abc123...

# Response:
{
  "id": "abc123...",
  "caption": "Beautiful sunset",
  "status": "PROCESSED",
  "approved": true,
  "width": 2000,
  "height": 1500,
  "largeKey": "events/.../large/abc123.jpg",
  "thumbKey": "events/.../thumb/abc123.jpg",
  "largeUrl": "https://pub-xxx.r2.dev/events/.../large/abc123.jpg",
  "thumbUrl": "https://pub-xxx.r2.dev/events/.../thumb/abc123.jpg",
  "createdAt": "2026-02-18T...",
  "event": {
    "id": "evt123",
    "name": "Summer Party 2024",
    "code": "SUMMER24"
  }
}
```

### 5. Approve/Reject Photo
```bash
PATCH http://localhost:3000/api/photos/abc123.../approve
Content-Type: application/json

{
  "approved": true
}

# Response:
{
  "success": true,
  "photoId": "abc123...",
  "approved": true
}
```

**Note:** Only works for events with `approvalRequired: true`

## Testing Flow

### Full Upload & Retrieval Flow
```bash
# 1. Create upload intent
curl -X POST http://localhost:3000/api/upload-intent \
  -H "Content-Type: application/json" \
  -d '{
    "eventCode": "SUMMER24",
    "contentType": "image/jpeg",
    "fileSizeBytes": 2048000,
    "caption": "Test photo"
  }'

# Save photoId and uploadUrl from response

# 2. Upload file to R2
curl -X PUT "<uploadUrl>" \
  -H "Content-Type: image/jpeg" \
  --data-binary "@/path/to/photo.jpg"

# 3. Complete upload
curl -X POST http://localhost:3000/api/upload-complete \
  -H "Content-Type: application/json" \
  -d '{ "photoId": "<photoId>" }'

# 4. Wait for worker to process (check logs)

# 5. Get all photos for event
curl http://localhost:3000/api/events/SUMMER24/photos

# 6. Get specific photo
curl http://localhost:3000/api/photos/<photoId>

# 7. If approval required, approve it
curl -X PATCH http://localhost:3000/api/photos/<photoId>/approve \
  -H "Content-Type: application/json" \
  -d '{ "approved": true }'
```

### Filter Examples
```bash
# Only processed photos
GET /api/events/SUMMER24/photos?status=PROCESSED

# Only approved photos
GET /api/events/SUMMER24/photos?approved=true

# Pending approval (for admin dashboard)
GET /api/events/SUMMER24/photos?status=PROCESSED&approved=false

# Failed uploads
GET /api/events/SUMMER24/photos?status=FAILED

# Cursor-based infinite scroll
GET /api/events/SUMMER24/photos?limit=30
# Then use nextCursor for next page
GET /api/events/SUMMER24/photos?limit=30&cursor=2026-02-18T23:15:00.000Z
```

## Image Validation

**Upload Intent Validation:**
- Only `image/jpeg` and `image/png` allowed
- Max file size: 10MB (client-side check)
- Caption max: 140 characters

**Worker Processing Validation:**
- Minimum dimensions: 200x200px
- Maximum dimensions: 12000x12000px
- Invalid images marked as `FAILED` status
- Sharp decode failures caught and logged

## Public URLs

Photos are served via Cloudflare R2 public domain:
- Set `R2_PUBLIC_BASE_URL` in `.env`
- Format: `https://pub-{account-id}.r2.dev`
- Or use custom domain if configured

URLs are automatically added to responses:
- `largeUrl`: Full resolution (max 2000px)
- `thumbUrl`: Thumbnail (max 400px)

## Error Handling

### Validation Errors
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "errors": [
    {
      "path": ["contentType"],
      "message": "Only JPEG and PNG images are allowed"
    }
  ]
}
```

### Rate Limiting
```json
{
  "statusCode": 400,
  "message": "Event upload limit reached"
}
```

### Not Found
```json
{
  "statusCode": 404,
  "message": "Photo not found"
}
```
