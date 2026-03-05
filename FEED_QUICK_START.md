# News Feed - Quick Start Guide

## What's New

The Gallery view has been replaced with a News Feed that includes:
- ❤️ Like system (no login required)
- 📊 Trending and Latest sorting
- ♾️ Infinite scroll
- ⚡ Optimistic updates for instant feedback
- 📱 App-like experience

## How to Use

### For Guests (Event Attendees)

1. **Access Event**: Navigate to `/e/{event-code}`
2. **Take Photos**: Use the Camera view to capture moments with templates
3. **View Feed**: Tap the "Feed" icon in bottom navigation
4. **Like Posts**: Tap the heart icon on any post
5. **Sort Feed**: Toggle between "Latest" and "Trending"
6. **Scroll**: Feed loads more items automatically as you scroll

### For Organizers

The feed automatically shows all processed photos from your event:
- If `approvalRequired` is enabled, only approved photos appear
- Like counts are visible to everyone
- No moderation tools yet (future enhancement)

## Technical Details

### Guest Identity
- Each device gets a unique `guestId` per event
- Stored in browser localStorage
- Format: `guest_{timestamp}_{random}`
- Used to track which posts you've liked

### Feed Sorting
- **Latest**: Most recent posts first (default)
- **Trending**: Most liked posts first, then by recency

### Performance
- Cursor-based pagination (stable, no duplicates)
- Lazy image loading
- Denormalized like counts (fast queries)
- Optimistic UI updates

## API Endpoints

### Get Feed
```bash
GET /api/events/:code/feed?sort=latest&limit=30&cursor=
Headers:
  X-Fete-Guest: {guestId}  # Optional, for likedByMe
```

### Like Photo
```bash
POST /api/photos/:id/like
Headers:
  X-Fete-Guest: {guestId}  # Required
```

### Unlike Photo
```bash
DELETE /api/photos/:id/like
Headers:
  X-Fete-Guest: {guestId}  # Required
```

## Testing

### Quick Test
```bash
# Make sure all services are running
./start-all.sh

# Run feed tests
./test-feed.sh
```

### Manual Test Flow
1. Start services: `./start-all.sh`
2. Create event via organizer dashboard
3. Open event as guest: `http://localhost:5173/e/{code}`
4. Upload 3-5 photos with templates
5. Switch to Feed view
6. Like/unlike posts (should update instantly)
7. Toggle between Latest and Trending
8. Scroll to test infinite loading
9. Open in another browser (different guestId)
10. Verify likes are tracked separately

## Troubleshooting

### Photos not appearing in feed
- ✅ Check worker is running: `npm run start:worker`
- ✅ Photos must be in PROCESSED status
- ✅ If approval required, photos must be approved

### Likes not working
- ✅ Check X-Fete-Guest header is being sent
- ✅ Check browser console for errors
- ✅ Verify backend is running

### Feed is empty
- ✅ Upload photos first via Camera view
- ✅ Wait for worker to process (check status in DB)
- ✅ Check event code is correct

## Database Schema

### Photo Table (Updated)
```sql
-- New columns
guestId String?      -- Guest who uploaded
likeCount Int @default(0)  -- Denormalized count

-- New indexes
@@index([eventId, likeCount, createdAt])  -- For trending
@@index([guestId])  -- For guest uploads
```

### Like Table (New)
```sql
model Like {
  id        String   @id @default(cuid())
  photoId   String
  guestId   String
  createdAt DateTime @default(now())
  
  @@unique([photoId, guestId])  -- One like per guest per photo
  @@index([photoId])
  @@index([createdAt])
}
```

## Files Changed

### Backend
- ✅ `src/feed/` - New feed module
- ✅ `src/likes/` - New likes module
- ✅ `src/app.module.ts` - Added modules
- ✅ `prisma/schema.prisma` - Added Like model

### Frontend
- ✅ `src/lib/guestId.ts` - Guest identity
- ✅ `src/lib/api.ts` - Feed/like methods
- ✅ `src/components/FeedItemCard.tsx` - Feed item UI
- ✅ `src/components/EventFeed.tsx` - Feed container
- ✅ `src/pages/EventPageNew.tsx` - Integrated feed

## Next Steps

The feed is production-ready! Future enhancements could include:
- Comments on posts
- Share to social media
- Push notifications for likes
- Content moderation tools
- Analytics dashboard
- Abuse reporting

## Support

For detailed implementation docs, see:
- `NEWS_FEED_IMPLEMENTATION.md` - Complete technical documentation
- `ARCHITECTURE.md` - System architecture
- `SERVICES_GUIDE.md` - Service dependencies
