# 🚀 Quick Reference Card

## Start Everything (One Command)

```bash
./start-all.sh
```

---

## Start Manually (4 Terminals)

```bash
# Terminal 1 - Redis
redis-server

# Terminal 2 - Backend API
cd fete-backend && npm run start:dev

# Terminal 3 - Worker (DON'T FORGET!)
cd fete-backend && npm run start:worker

# Terminal 4 - Frontend
cd fete-web && npm run dev
```

---

## URLs

| Service | URL |
|---------|-----|
| Guest Home | http://localhost:5173 |
| Organizer Login | http://localhost:5173/org/login |
| Dashboard | http://localhost:5173/org/dashboard |
| API | http://localhost:3000 |
| Test Event | http://localhost:5173/e/AB3X9K |

---

## Health Checks

```bash
# Redis
redis-cli ping

# Backend
curl http://localhost:3000

# Frontend
curl http://localhost:5173

# Worker (check logs)
ps aux | grep worker.main
```

---

## Common Issues

| Problem | Solution |
|---------|----------|
| Photos not appearing | Start worker: `npm run start:worker` |
| Connection refused | Start Redis: `redis-server` |
| Port in use | Kill process: `lsof -i :3000` then `kill -9 <PID>` |
| Upload fails | Check R2 credentials in `.env` |

---

## Important Commands

```bash
# Reset database
cd fete-backend && npx prisma migrate reset

# Seed database
cd fete-backend && npx prisma db seed

# Check queue
redis-cli llen bull:photo-processing:wait

# View logs
# Just watch terminal output
```

---

## Test Flow

1. Go to http://localhost:5173/org/signup
2. Create account
3. Create event
4. Get event code
5. Go to http://localhost:5173
6. Enter event code
7. Upload photo
8. Photo appears in gallery ✅

---

## Documentation

| File | Purpose |
|------|---------|
| `START_HERE.md` | Main guide |
| `STARTUP_CHECKLIST.md` | Step-by-step setup |
| `WORKER_IMPORTANCE.md` | Why worker matters |
| `SERVICES_GUIDE.md` | All services explained |
| `ORGANIZER_QUICK_START.md` | Organizer guide |

---

## Remember

⚠️ **4 Services Required:**
1. Redis
2. Backend API
3. **Worker** ← Don't forget!
4. Frontend

🚨 **No Worker = No Photos**
