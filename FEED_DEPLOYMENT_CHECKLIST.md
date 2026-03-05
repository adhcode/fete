# News Feed - Deployment Checklist

## Pre-Deployment Verification

### Backend
- [x] Prisma migration created and applied
- [x] Feed module implemented and tested
- [x] Likes module implemented and tested
- [x] Modules registered in app.module.ts
- [x] TypeScript compilation successful
- [x] No linting errors
- [x] All endpoints are public (@Public decorator)
- [x] Guest ID validation in place

### Frontend
- [x] Guest ID management implemented
- [x] API client updated with feed methods
- [x] FeedItemCard component created
- [x] EventFeed component created
- [x] EventPageNew integrated with feed
- [x] TypeScript compilation successful
- [x] No console errors
- [x] Optimistic updates working

### Database
- [x] Like model created
- [x] Photo model updated (guestId, likeCount)
- [x] Indexes created for performance
- [x] Unique constraint on likes
- [x] Migration tested locally

## Deployment Steps

### 1. Database Migration
```bash
cd fete-backend
npx prisma migrate deploy  # Production
# OR
npx prisma migrate dev     # Development
```

### 2. Backend Deployment
```bash
cd fete-backend
npm run build
npm run start:prod

# In separate terminal
npm run start:worker
```

### 3. Frontend Deployment
```bash
cd fete-web
npm run build
# Deploy dist/ folder to your hosting
```

### 4. Verify Services
- [ ] Backend API responding: `curl http://localhost:3000/api/events/{code}/feed`
- [ ] Worker processing photos
- [ ] Frontend loading correctly
- [ ] Redis connected

## Post-Deployment Testing

### Smoke Tests
- [ ] Can access event page
- [ ] Can upload photo with template
- [ ] Photo appears in feed after processing
- [ ] Can like/unlike posts
- [ ] Like count updates correctly
- [ ] Can toggle between Latest/Trending
- [ ] Infinite scroll loads more items
- [ ] Different devices have different guestIds

### Performance Tests
- [ ] Feed loads in < 500ms
- [ ] Like operation completes in < 200ms
- [ ] Infinite scroll is smooth (60fps)
- [ ] No memory leaks on long scrolling
- [ ] Images load lazily

### Edge Cases
- [ ] Empty feed shows helpful message
- [ ] Missing guest ID returns 400 error
- [ ] Invalid cursor is handled gracefully
- [ ] Duplicate likes are idempotent
- [ ] Negative like counts prevented
- [ ] Approved-only events work correctly

## Monitoring

### Metrics to Track
- Feed response time (p50, p95, p99)
- Like operation latency
- Error rate on feed endpoint
- Error rate on like endpoints
- Database query performance
- Worker processing time

### Alerts to Set Up
- Feed endpoint error rate > 1%
- Like endpoint error rate > 1%
- Feed response time > 1s
- Database connection failures
- Worker queue backlog > 100

## Rollback Plan

If issues occur:

### 1. Frontend Rollback
```bash
# Deploy previous version
cd fete-web
git checkout <previous-commit>
npm run build
# Deploy dist/
```

### 2. Backend Rollback
```bash
# Deploy previous version
cd fete-backend
git checkout <previous-commit>
npm run build
npm run start:prod
```

### 3. Database Rollback
```bash
# Revert migration (CAUTION: may lose data)
cd fete-backend
npx prisma migrate resolve --rolled-back 20260301161721_add_likes_and_feed_support
```

**Note**: Database rollback will lose all likes. Consider keeping the schema and just rolling back code.

## Environment Variables

No new environment variables required! The feed uses existing:
- `DATABASE_URL` - Postgres connection
- `R2_PUBLIC_BASE_URL` - For image URLs
- `JWT_SECRET` - For organizer auth (not used by feed)

## Known Limitations

1. **No Rate Limiting**: Guests can like/unlike rapidly (future enhancement)
2. **No Analytics**: Like events not tracked (future enhancement)
3. **No Moderation**: No tools to remove inappropriate content (future enhancement)
4. **No Notifications**: Users not notified of likes (future enhancement)

## Support Resources

- Technical docs: `NEWS_FEED_IMPLEMENTATION.md`
- Quick start: `FEED_QUICK_START.md`
- Test script: `./test-feed.sh`
- Architecture: `ARCHITECTURE.md`

## Success Criteria

Deployment is successful when:
- ✅ All smoke tests pass
- ✅ No errors in logs
- ✅ Feed loads in < 500ms
- ✅ Like operations work correctly
- ✅ Infinite scroll is smooth
- ✅ Worker processing photos
- ✅ No breaking changes to existing features

## Post-Deployment Tasks

- [ ] Monitor error rates for 24 hours
- [ ] Check database query performance
- [ ] Verify worker is processing
- [ ] Test on mobile devices
- [ ] Gather user feedback
- [ ] Update documentation if needed

## Emergency Contacts

If critical issues occur:
1. Check logs: `pm2 logs` or `docker logs`
2. Check database: `psql $DATABASE_URL`
3. Check Redis: `redis-cli ping`
4. Rollback if necessary (see above)

---

**Deployment Date**: _____________
**Deployed By**: _____________
**Version**: 1.0.0
**Status**: ⬜ Pending / ⬜ In Progress / ⬜ Complete
