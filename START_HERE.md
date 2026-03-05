# 🚀 START HERE - Fete Complete Application

## What You Have

A complete, production-ready event photo sharing application with:

✅ **Guest Experience**
- Snapchat-style template swipe
- Camera with live preview
- Photo/video upload
- Gallery and stories

✅ **Organizer Experience**
- Authentication (signup/login)
- Event creation and management
- Template creation and management
- Dashboard with analytics

✅ **Backend**
- JWT authentication
- Protected API endpoints
- Template system
- Image/video processing
- Queue-based workflows

---

## Quick Start (4 Steps)

### Prerequisites
- Node.js installed
- Redis running (`redis-server`)
- PostgreSQL database (Neon)
- Cloudflare R2 configured

### 1. Start Redis (Required!)
```bash
# In a new terminal
redis-server
```

### 2. Start Backend API
```bash
# Terminal 1
cd fete-backend
npm run start:dev
```

### 3. Start Worker (Required for photo/video processing!)
```bash
# Terminal 2
cd fete-backend
npm run start:worker
```

### 4. Start Frontend
```bash
# Terminal 3
cd fete-web
npm run dev
```

### OR Use the Automated Script
```bash
# Starts all services automatically
./start-all.sh
```

---

## Why You Need the Worker

The **worker process** is essential for:
- ✅ Processing uploaded photos (resizing, thumbnails)
- ✅ Processing uploaded videos (transcoding, thumbnails)
- ✅ Generating different image sizes (large, thumb)
- ✅ Extracting video metadata
- ✅ Queue-based background processing

**Without the worker:**
- ❌ Photos will stay in "PENDING_UPLOAD" status
- ❌ Videos won't be transcoded
- ❌ Thumbnails won't be generated
- ❌ Images won't appear in gallery

---

## Services Overview

| Service | Port | Purpose | Required |
|---------|------|---------|----------|
| Redis | 6379 | Queue management | ✅ Yes |
| Backend API | 3000 | REST API | ✅ Yes |
| Worker | - | Process uploads | ✅ Yes |
| Frontend | 5173 | Web interface | ✅ Yes |

---

## Open Browser

After starting all services:

- **Guest**: http://localhost:5173
- **Organizer**: http://localhost:5173/org/login

---

## Test the Application

### As an Organizer

1. **Signup**
   - Go to http://localhost:5173/org/signup
   - Create account
   - You'll be redirected to dashboard

2. **Create Event**
   - Click "Create Event"
   - Fill in event details
   - Select a template
   - Get event code (e.g., AB3X9K)

3. **Share with Guests**
   - Click "Open Guest Link"
   - Share the URL or event code

### As a Guest

1. **Join Event**
   - Go to http://localhost:5173
   - Enter event code
   - Or use direct link

2. **Upload Photos**
   - Swipe left/right to change templates
   - Capture or upload photo
   - Template applied automatically
   - Upload to event

---

## Key URLs

### Guest URLs
- Home: `http://localhost:5173`
- Event: `http://localhost:5173/e/{CODE}`

### Organizer URLs
- Login: `http://localhost:5173/org/login`
- Signup: `http://localhost:5173/org/signup`
- Dashboard: `http://localhost:5173/org/dashboard`
- New Event: `http://localhost:5173/org/events/new`
- New Template: `http://localhost:5173/org/templates/new`

---

## Documentation

### Quick Guides
- **`ORGANIZER_QUICK_START.md`** - Step-by-step organizer guide
- **`START_HERE.md`** - This file

### Complete Documentation
- **`COMPLETE_FEATURE_SUMMARY.md`** - All features overview
- **`ORGANIZER_UI_COMPLETE.md`** - UI documentation
- **`SWIPE_AND_AUTH_IMPLEMENTATION.md`** - Technical details
- **`FEATURE_COMPLETE.md`** - Part 1 & 2 summary

### Testing
- **`test-auth-flow.sh`** - Automated test script

---

## Features Overview

### Template Swipe
- Swipe left/right to change templates
- Keyboard support (arrow keys)
- Animated name pill
- Dots indicator
- 60fps performance

### Authentication
- JWT-based auth
- bcrypt password hashing
- Protected routes
- Ownership-based access

### Event Management
- Create events with settings
- Template selection
- Photo count tracking
- Guest link generation

### Template Management
- Create custom templates
- JSON configuration
- Template variables
- Overlay support

---

## Default Credentials

The system comes with pre-seeded templates but no default organizer account.

**Create your first account:**
1. Go to http://localhost:5173/org/signup
2. Fill in your details
3. Start creating events!

**Pre-seeded Templates:**
- Classic (white text at bottom)
- Minimal (smaller text)
- Party (colorful with hashtag)

**Test Event Code:**
- `AB3X9K` (if seeded)

---

## Common Tasks

### Create an Event
```
Dashboard → Create Event → Fill Form → Success
```

### Create a Template
```
Dashboard → Create Template → Configure JSON → Success
```

### View Events
```
Dashboard → See all events with stats
```

### Test Guest Experience
```
Home → Enter Code → Camera → Swipe → Upload
```

---

## Troubleshooting

### Backend Won't Start
```bash
# Check dependencies
cd fete-backend && npm install

# Check database
npx prisma migrate dev

# Check .env file
cat .env
```

### Frontend Won't Start
```bash
# Check dependencies
cd fete-web && npm install

# Check .env file
cat .env
```

### Can't Login
- Check backend is running (port 3000)
- Check JWT_SECRET in backend/.env
- Check email/password are correct

### Template Not Showing
- Check template was created
- Check template config JSON is valid
- Check backend logs

---

## Environment Setup

### Backend (.env)
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
R2_ENDPOINT=https://...
R2_BUCKET=fete-photos
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_PUBLIC_BASE_URL=https://...
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:3000
```

---

## Tech Stack

- **Frontend**: React + Vite + TypeScript + Tailwind
- **Backend**: NestJS + Prisma + PostgreSQL
- **Storage**: Cloudflare R2
- **Queue**: BullMQ + Redis
- **Auth**: JWT + Passport

---

## What's Next?

Now that everything is set up:

1. ✅ Create your organizer account
2. ✅ Create your first event
3. ✅ Create custom templates
4. ✅ Share with guests
5. ✅ Monitor uploads

Enjoy using Fete! 🎉

---

## Need Help?

- Check documentation files
- Run `./test-auth-flow.sh` for automated testing
- Check backend logs for errors
- Check browser console for frontend errors

---

## Production Deployment

When ready to deploy:

1. Set production environment variables
2. Run database migrations
3. Build frontend: `npm run build`
4. Deploy backend to your server
5. Deploy frontend to CDN/hosting
6. Configure domain and SSL

See deployment documentation for details.
