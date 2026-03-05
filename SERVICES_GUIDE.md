# 🔧 Services Guide - Complete Setup

## Overview

Fete requires **4 services** to run properly:

1. **Redis** - Queue management
2. **Backend API** - REST API server
3. **Worker** - Background job processor
4. **Frontend** - Web interface

---

## Service Details

### 1. Redis (Port 6379)

**Purpose:** Message queue for background jobs

**Required for:**
- Photo processing queue
- Video processing queue
- Job status tracking

**Start:**
```bash
redis-server
```

**Verify:**
```bash
redis-cli ping
# Should return: PONG
```

**Troubleshooting:**
```bash
# Check if Redis is running
ps aux | grep redis

# Check Redis logs
redis-cli info

# Restart Redis
redis-cli shutdown
redis-server
```

---

### 2. Backend API (Port 3000)

**Purpose:** REST API server

**Handles:**
- Authentication (signup/login)
- Event CRUD
- Template CRUD
- Upload intents
- Photo/video metadata

**Start:**
```bash
cd fete-backend
npm run start:dev
```

**Verify:**
```bash
curl http://localhost:3000
# Should return: Hello World!
```

**Logs:**
- Watch terminal for request logs
- Errors appear in red
- Successful requests in green

**Troubleshooting:**
```bash
# Check if port 3000 is in use
lsof -i :3000

# Check environment variables
cat fete-backend/.env

# Check database connection
cd fete-backend
npx prisma db pull
```

---

### 3. Worker (Background Process)

**Purpose:** Process uploaded photos and videos

**Handles:**
- Image resizing (large, thumb)
- Video transcoding (mp4)
- Thumbnail generation
- Status updates (PENDING → PROCESSED)
- R2 storage operations

**Start:**
```bash
cd fete-backend
npm run start:worker
```

**Verify:**
Look for these logs:
```
[Nest] Worker process started
[Nest] PhotoProcessor registered
[Nest] Connected to Redis
```

**What happens without worker:**
- ❌ Photos stay in PENDING_UPLOAD status
- ❌ No thumbnails generated
- ❌ Videos not transcoded
- ❌ Photos don't appear in gallery
- ❌ Upload appears to "hang"

**Troubleshooting:**
```bash
# Check worker logs
# Look for errors in terminal

# Check Redis connection
redis-cli ping

# Check R2 credentials
cat fete-backend/.env | grep R2

# Restart worker
# Ctrl+C in worker terminal
npm run start:worker
```

---

### 4. Frontend (Port 5173)

**Purpose:** Web interface (React + Vite)

**Serves:**
- Guest pages (home, event, camera)
- Organizer pages (login, dashboard, forms)

**Start:**
```bash
cd fete-web
npm run dev
```

**Verify:**
Open http://localhost:5173 in browser

**Troubleshooting:**
```bash
# Check if port 5173 is in use
lsof -i :5173

# Check environment variables
cat fete-web/.env

# Clear cache and restart
rm -rf fete-web/node_modules/.vite
npm run dev
```

---

## Quick Start Commands

### Automated (Recommended)
```bash
# Starts all services in separate terminals
./start-all.sh
```

### Manual
```bash
# Terminal 1 - Redis
redis-server

# Terminal 2 - Backend API
cd fete-backend && npm run start:dev

# Terminal 3 - Worker
cd fete-backend && npm run start:worker

# Terminal 4 - Frontend
cd fete-web && npm run dev
```

---

## Service Dependencies

```
Frontend (5173)
    ↓
Backend API (3000)
    ↓
Redis (6379) ← Worker (background)
    ↓
PostgreSQL (Neon)
    ↓
Cloudflare R2
```

**Startup Order:**
1. Redis (must be first)
2. Backend API
3. Worker (can start anytime after Redis)
4. Frontend (can start anytime)

---

## Health Checks

### Check All Services
```bash
# Redis
redis-cli ping

# Backend API
curl http://localhost:3000

# Frontend
curl http://localhost:5173

# Worker (check logs)
# Should see "PhotoProcessor registered"
```

### Check Service Status
```bash
# Redis
ps aux | grep redis-server

# Backend API
lsof -i :3000

# Frontend
lsof -i :5173

# Worker
ps aux | grep "nest start --watch --entryFile worker"
```

---

## Common Issues

### Issue: Photos not appearing in gallery

**Cause:** Worker not running

**Solution:**
```bash
cd fete-backend
npm run start:worker
```

**Verify:** Check worker logs for "PhotoProcessor registered"

---

### Issue: "Connection refused" errors

**Cause:** Redis not running

**Solution:**
```bash
redis-server
```

**Verify:** `redis-cli ping` returns PONG

---

### Issue: "Port already in use"

**Cause:** Service already running

**Solution:**
```bash
# Find process using port
lsof -i :3000  # or :5173

# Kill process
kill -9 <PID>

# Restart service
```

---

### Issue: Worker crashes immediately

**Cause:** Missing environment variables or Redis connection

**Solution:**
```bash
# Check .env file
cat fete-backend/.env

# Verify Redis is running
redis-cli ping

# Check R2 credentials
echo $R2_ACCESS_KEY_ID
```

---

## Production Deployment

### Services to Deploy

1. **Backend API** - Deploy to server (e.g., Railway, Render)
2. **Worker** - Deploy as separate process
3. **Frontend** - Deploy to CDN (e.g., Vercel, Netlify)
4. **Redis** - Use managed service (e.g., Upstash, Redis Cloud)
5. **PostgreSQL** - Already on Neon
6. **R2** - Already on Cloudflare

### Environment Variables

**Backend + Worker:**
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
R2_ENDPOINT=https://...
R2_BUCKET=fete-photos
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_PUBLIC_BASE_URL=https://...
JWT_SECRET=...
```

**Frontend:**
```env
VITE_API_URL=https://api.yourdomain.com
```

### Deployment Commands

**Backend API:**
```bash
npm run build
npm run start:prod
```

**Worker:**
```bash
npm run build
npm run worker:prod
```

**Frontend:**
```bash
npm run build
# Deploy dist/ folder to CDN
```

---

## Monitoring

### Logs to Watch

**Backend API:**
- Request logs
- Error logs
- Database queries

**Worker:**
- Job processing logs
- Error logs
- Queue status

**Redis:**
- Queue length
- Memory usage
- Connection count

### Useful Commands

```bash
# Check Redis queue length
redis-cli llen bull:photo-processing:wait

# Check Redis memory
redis-cli info memory

# Monitor Redis commands
redis-cli monitor

# Check worker jobs
redis-cli keys "bull:*"
```

---

## Summary

✅ **4 services required:**
1. Redis (queue)
2. Backend API (REST)
3. Worker (processing)
4. Frontend (UI)

✅ **Worker is essential** for photo/video processing

✅ **Use `./start-all.sh`** for easy startup

✅ **Check logs** if something doesn't work

✅ **Redis must run first** before other services
