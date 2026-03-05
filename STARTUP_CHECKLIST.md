# ✅ Startup Checklist

## Before You Start

### 1. Check Prerequisites

- [ ] Node.js 18+ installed (`node --version`)
- [ ] Redis installed (`redis-server --version`)
- [ ] Git installed (`git --version`)
- [ ] PostgreSQL database (Neon account)
- [ ] Cloudflare R2 account

### 2. Clone and Install

```bash
# Clone repository
git clone <repo-url>
cd fete

# Install backend dependencies
cd fete-backend
npm install

# Install frontend dependencies
cd ../fete-web
npm install
```

### 3. Configure Environment

**Backend (.env):**
```bash
cd fete-backend
cp .env.example .env
```

Edit `fete-backend/.env`:
```env
DATABASE_URL="postgresql://user:pass@host/db"
REDIS_URL="redis://localhost:6379"
R2_ENDPOINT="https://[account-id].r2.cloudflarestorage.com"
R2_BUCKET="fete-photos"
R2_ACCESS_KEY_ID="your_key"
R2_SECRET_ACCESS_KEY="your_secret"
R2_PUBLIC_BASE_URL="https://pub-xxx.r2.dev"
JWT_SECRET="your-super-secret-key"
```

**Frontend (.env):**
```bash
cd fete-web
cp .env.example .env
```

Edit `fete-web/.env`:
```env
VITE_API_URL="http://localhost:3000"
```

### 4. Setup Database

```bash
cd fete-backend

# Run migrations
npx prisma migrate dev

# Seed database (creates templates and test event)
npx prisma db seed
```

---

## Starting Services

### Option 1: Automated Script (Recommended)

```bash
# From project root
./start-all.sh
```

This will:
1. Check if Redis is running
2. Open 3 terminals automatically:
   - Backend API (port 3000)
   - Worker (background)
   - Frontend (port 5173)

### Option 2: Manual Start

**Step 1: Start Redis**
```bash
# Terminal 1
redis-server
```

**Step 2: Start Backend API**
```bash
# Terminal 2
cd fete-backend
npm run start:dev
```

Wait for: `Nest application successfully started`

**Step 3: Start Worker**
```bash
# Terminal 3
cd fete-backend
npm run start:worker
```

Wait for: `PhotoProcessor registered`

**Step 4: Start Frontend**
```bash
# Terminal 4
cd fete-web
npm run dev
```

Wait for: `Local: http://localhost:5173`

---

## Verification Steps

### 1. Check Redis
```bash
redis-cli ping
# Expected: PONG
```

### 2. Check Backend API
```bash
curl http://localhost:3000
# Expected: Hello World!
```

### 3. Check Frontend
Open browser: http://localhost:5173
- Should see Fete home page
- Should see "Organizer Login" link

### 4. Check Worker
Look at Terminal 3 logs:
```
[Nest] Worker process started
[Nest] PhotoProcessor registered
[Nest] Connected to Redis
```

### 5. Test Complete Flow

**Create Organizer Account:**
1. Go to http://localhost:5173/org/signup
2. Fill in details
3. Should redirect to dashboard

**Create Event:**
1. Click "Create Event"
2. Fill in event name
3. Select template
4. Get event code

**Test Guest Upload:**
1. Go to http://localhost:5173
2. Enter event code
3. Upload a photo
4. Wait 5-10 seconds
5. Photo should appear in gallery

---

## Troubleshooting

### Redis Not Running

**Symptom:** Backend crashes with "ECONNREFUSED"

**Solution:**
```bash
redis-server
```

### Worker Not Running

**Symptom:** Photos stay in "pending" status

**Solution:**
```bash
cd fete-backend
npm run start:worker
```

### Port Already in Use

**Symptom:** "EADDRINUSE" error

**Solution:**
```bash
# Find process
lsof -i :3000  # or :5173

# Kill process
kill -9 <PID>

# Restart service
```

### Database Connection Error

**Symptom:** "Can't reach database server"

**Solution:**
```bash
# Check DATABASE_URL in .env
cat fete-backend/.env | grep DATABASE_URL

# Test connection
cd fete-backend
npx prisma db pull
```

### R2 Upload Fails

**Symptom:** "Failed to upload file"

**Solution:**
```bash
# Check R2 credentials in .env
cat fete-backend/.env | grep R2

# Verify R2 bucket exists
# Check Cloudflare dashboard
```

---

## Service Status Commands

### Check All Services
```bash
# Redis
redis-cli ping

# Backend API
curl http://localhost:3000

# Frontend
curl http://localhost:5173

# Worker (check logs)
ps aux | grep "worker.main"
```

### Stop All Services
```bash
# Stop Redis
redis-cli shutdown

# Stop Backend/Worker/Frontend
# Press Ctrl+C in each terminal
```

### Restart Services
```bash
# Restart Redis
redis-cli shutdown
redis-server

# Restart Backend
# Ctrl+C in terminal, then:
npm run start:dev

# Restart Worker
# Ctrl+C in terminal, then:
npm run start:worker

# Restart Frontend
# Ctrl+C in terminal, then:
npm run dev
```

---

## Quick Reference

### Service Ports
- Redis: 6379
- Backend API: 3000
- Frontend: 5173

### Important URLs
- Guest Home: http://localhost:5173
- Organizer Login: http://localhost:5173/org/login
- API Docs: http://localhost:3000
- Test Event: http://localhost:5173/e/AB3X9K

### Default Test Data
- Event Code: `AB3X9K`
- Event Name: "Summer Beach Party 2026 🌊"
- Templates: Classic, Minimal, Party

### Useful Commands
```bash
# Reset database
cd fete-backend
npx prisma migrate reset

# View Redis queue
redis-cli llen bull:photo-processing:wait

# Check logs
# Just watch the terminal output

# Run tests
cd fete-backend
npm test
```

---

## Success Indicators

✅ **Redis:** `redis-cli ping` returns PONG
✅ **Backend:** Terminal shows "Nest application successfully started"
✅ **Worker:** Terminal shows "PhotoProcessor registered"
✅ **Frontend:** Browser shows Fete home page
✅ **Upload:** Photo appears in gallery after upload

---

## Next Steps

After successful startup:

1. ✅ Create organizer account
2. ✅ Create your first event
3. ✅ Test guest upload
4. ✅ Create custom template
5. ✅ Share event with friends

---

## Getting Help

If you encounter issues:

1. Check this checklist
2. Read `SERVICES_GUIDE.md`
3. Check terminal logs for errors
4. Verify environment variables
5. Ensure all services are running

---

## Summary

**Required Services (4):**
1. Redis (queue)
2. Backend API (REST)
3. Worker (processing) ← **Don't forget this!**
4. Frontend (UI)

**Startup Order:**
1. Redis first
2. Backend API
3. Worker (anytime after Redis)
4. Frontend (anytime)

**Quick Start:**
```bash
./start-all.sh
```

That's it! 🎉
