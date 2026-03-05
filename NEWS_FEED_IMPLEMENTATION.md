# News Feed Implementation - Complete

## Overview

Successfully implemented a production-ready News Feed system for Fete with likes, trending/latest sorting, and infinite scroll. The feed replaces the gallery view and provides an app-like experience.

## Features Implemented

### Backend (NestJS + Prisma)

#### 1. Data Model (Prisma Schema)
- **Photo Model Updates**:
  - Added `guestId String?` (indexed) - stable guest identity per device per event
  - Added `likeCount Int @default(0)` (indexed) - denormalized for performance
  - Added composite index `@@index([eventId, likeCount, createdAt])` for trending feed

- **Like Model** (New):
  - `id` (cuid)
  - `photoId` (FK to Photo)
  - `guestId` (String)
  - `createdAt` (DateTime)
  - Unique constraint: `@@unique([photoId, guestId])` - prevents duplicate likes
  - Indexes on `photoId` and `createdAt`

#### 2. Feed Module (`fete-backend/src/feed/`)
- **FeedService**:
  - `getEventFeed(eventCode, query, guestId)` - cursor-based pagination
  - Supports "latest" (createdAt desc) and "trending" (likeCount desc, createdAt desc) sorting
  - Computes `likedByMe` from Like table using guestId
  - Returns only approved media if event.approvalRequired = true
  - Cursor format: `{createdAt}_{id}` for stable ordering

- **FeedController**:
  - `GET /api/events/:code/feed?sort=latest|trending&cursor=&limit=30`
  - Extracts guestId from `X-Fete-Guest` header
  - Public endpoint (no auth required)

#### 3. Likes Module (`fete-backend/src/likes/`)
- **LikesService**:
  - `likePhoto(photoId, guestId)` - atomic increment with transaction
  - `unlikePhoto(photoId, guestId)` - atomic decrement with transaction
  - Idempotent operations (safe to call multiple times)
  - Prevents likeCount from going negative
  - Uses Prisma transactions for atomicity

- **LikesController**:
  - `POST /api/photos/:id/like`
  - `DELETE /api/photos/:id/like`
  - Both require `X-Fete-Guest` header, return 400 if missing
  - Public endpoints (no auth required)

### Frontend (React + Vite)

#### 1. Guest Identity Management (`fete-web/src/lib/guestId.ts`)
- Generates stable guestId per device per event
- Format: `guest_{timestamp}_{random}`
- Stored in localStorage scoped by event code
- Key format: `fete_guest_{eventCode}`

#### 2. API Client Updates (`fete-web/src/lib/api.ts`)
- Added `setCurrentEvent(eventCode)` method
- Automatically adds `X-Fete-Guest` header to all requests
- New methods:
  - `getEventFeed(code, sort, cursor, limit)` - fetch feed with pagination
  - `likePhoto(id)` - like a photo
  - `unlikePhoto(id)` - unlike a photo

#### 3. Feed Components

**FeedItemCard** (`fete-web/src/components/FeedItemCard.tsx`):
- Displays image/video with thumb/poster
- Like button with heart icon (filled when liked)
- Shows like count
- Optimistic updates (instant UI feedback)
- Rollback on error
- Supports both images and videos

**EventFeed** (`fete-web/src/components/EventFeed.tsx`):
- Infinite scroll with IntersectionObserver
- Sort toggle (Latest | Trending)
- Cursor-based pagination
- Lazy image loading
- Loading states (initial, loading more, end of feed)
- Empty state with helpful message

#### 4. Event Page Integration (`fete-web/src/pages/EventPageNew.tsx`)
- Replaced "Gallery" view with "Feed" view
- Initializes guestId on mount
- Sets current event in API client
- Bottom navigation updated: Feed | Camera | Stories
- Feed view shows EventFeed component with full-screen scrolling

## API Endpoints

### Feed
```
GET /api/events/:code/feed
Query params:
  - sort: 'latest' | 'trending' (default: 'latest')
  - cursor: string (optional, for pagination)
  - limit: number (default: 30, max: 100)
Headers:
  - X-Fete-Guest: string (optional, for likedByMe computation)

Response:
{
  items: [
    {
      id: string,
      caption?: string,
      mediaType: 'IMAGE' | 'VIDEO',
      mimeType?: string,
      width?: number,
      height?: number,
      likeCount: number,
      likedByMe: boolean,
      createdAt: string,
      // For images:
      largeUrl?: string,
      thumbUrl?: string,
      // For videos:
      playUrl?: string,
      posterUrl?: string,
      durationSec?: number
    }
  ],
  nextCursor: string | null
}
```

### Likes
```
POST /api/photos/:id/like
Headers:
  - X-Fete-Guest: string (required)

Response:
{
  likeCount: number,
  likedByMe: boolean
}

DELETE /api/photos/:id/like
Headers:
  - X-Fete-Guest: string (required)

Response:
{
  likeCount: number,
  likedByMe: boolean
}
```

## Database Migration

Migration created: `20260301161721_add_likes_and_feed_support`

Changes:
- Added `guestId` and `likeCount` columns to Photo table
- Created Like table with unique constraint
- Added indexes for performance

## Performance Optimizations

1. **Denormalized Like Count**: Stored on Photo table to avoid COUNT(*) queries
2. **Atomic Operations**: Prisma transactions ensure data consistency
3. **Cursor-based Pagination**: Stable ordering, no offset drift
4. **Lazy Loading**: Images load only when visible
5. **Infinite Scroll**: IntersectionObserver for efficient scroll detection
6. **Optimistic Updates**: Instant UI feedback for likes
7. **Indexed Queries**: All feed queries use indexed columns

## Testing

### Backend
```bash
cd fete-backend
npm run build  # ✓ Compiles successfully
```

### Frontend
```bash
cd fete-web
npm run build  # ✓ Builds successfully
```

### Manual Testing Flow
1. Start all services (Redis, Backend, Worker, Frontend)
2. Navigate to event page `/e/{code}`
3. Upload a photo with template
4. Switch to Feed view
5. Like/unlike photos (should update instantly)
6. Toggle between Latest and Trending
7. Scroll to load more items
8. Test on multiple devices (different guestIds)

## Files Created

### Backend
- `fete-backend/src/feed/dto.ts`
- `fete-backend/src/feed/feed.service.ts`
- `fete-backend/src/feed/feed.controller.ts`
- `fete-backend/src/feed/feed.module.ts`
- `fete-backend/src/likes/likes.service.ts`
- `fete-backend/src/likes/likes.controller.ts`
- `fete-backend/src/likes/likes.module.ts`
- `fete-backend/prisma/migrations/20260301161721_add_likes_and_feed_support/migration.sql`

### Frontend
- `fete-web/src/lib/guestId.ts`
- `fete-web/src/components/FeedItemCard.tsx`
- `fete-web/src/components/EventFeed.tsx`

## Files Modified

### Backend
- `fete-backend/src/app.module.ts` - Added FeedModule and LikesModule
- `fete-backend/src/uploads/uploads.service.ts` - Set guestId on photo creation
- `fete-backend/prisma/schema.prisma` - Added Like model and Photo updates

### Frontend
- `fete-web/src/lib/api.ts` - Added feed/like methods and X-Fete-Guest header
- `fete-web/src/types/index.ts` - Added FeedItem type
- `fete-web/src/pages/EventPageNew.tsx` - Replaced Gallery with Feed
- `fete-web/src/components/CameraView.tsx` - Fixed NodeJS.Timeout type
- `fete-web/src/components/StoryViewer.tsx` - Fixed NodeJS.Timeout type
- `fete-web/src/pages/NewTemplatePage.tsx` - Removed unused api import

## Architecture Decisions

1. **Guest Identity**: No authentication required, stable per device per event
2. **Denormalized Counts**: Trade write complexity for read performance
3. **Cursor Pagination**: More stable than offset for real-time feeds
4. **Optimistic Updates**: Better UX, rollback on error
5. **Public Endpoints**: Feed and likes don't require organizer auth
6. **Idempotent Operations**: Safe to retry, no duplicate likes

## Future Enhancements (Not in Scope)

- Photo/video deletion
- Content retention policies
- Comment system
- Share to social media
- Push notifications for likes
- Analytics dashboard
- Abuse reporting
- Content moderation tools

## Notes

- Worker process must be running for photos to appear in feed (PROCESSED status required)
- Feed only shows approved media if event.approvalRequired = true
- Guest IDs are device-specific, not user accounts
- Like counts are eventually consistent (optimistic updates may briefly show incorrect counts)
- No rate limiting on likes (could be added if needed)
