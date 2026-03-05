# Fete - Event Photo Sharing Platform

A modern, scalable photo sharing platform for events. Guests upload photos using simple event codes, organizers manage approvals, and everyone enjoys a shared gallery.

## Architecture

```
fete-backend/     NestJS API + Worker (TypeScript)
fete-web/         Product App (Vite + React)
fete-site/        Marketing Site (Next.js)
```

### Why This Architecture?

- **fete-backend**: Handles all business logic, image processing, and data management
- **fete-web**: Fast, interactive product app optimized for guests (Vite for instant HMR)
- **fete-site**: SEO-optimized marketing pages + share previews (Next.js for SSR/SSG)

## Quick Start

### 1. Backend Setup

```bash
cd fete-backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your credentials

# Setup database
npx prisma migrate dev
npm run prisma:seed

# Start API server
npm run start:dev

# Start worker (separate terminal)
npm run start:worker
```

### 2. Web App Setup

```bash
cd fete-web

# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Set VITE_API_URL=http://localhost:3000

# Start dev server
npm run dev
```

### 3. Marketing Site Setup

```bash
cd fete-site

# Install dependencies
npm install

# Start dev server
npm run dev
```

## Services

- **Backend API**: http://localhost:3000
- **Web App**: http://localhost:5173
- **Marketing Site**: http://localhost:3001

## Core Features

### Guest Flow
1. Enter event code (e.g., `AB3X9K`)
2. Land on story-first event page
3. View story circles (My Story + others)
4. Tap floating camera button to capture
5. Apply Snapchat-style templates with swipe gestures
6. Add optional caption
7. Upload to story with success toast
8. View stories in fullscreen immersive viewer
9. Browse recent moments grid

### Organizer Flow
1. Create events with unique codes
2. Configure approval settings and templates
3. Add custom theme colors to templates
4. Review and approve photos
5. Manage event settings
6. View event dashboard

### Technical Features
- **Story-First UI**: Instagram/Snapchat-style story experience
- **Dynamic Theming**: UI adapts to event template colors
- **Camera-First**: Snapchat-style camera with live template overlay
- **Template System**: Swipeable templates with WYSIWYG preview
- **Floating Camera**: Always-accessible FAB with glow animation
- **Guest Identity**: Stable per-device identity (no login required)
- **60fps Animations**: Framer Motion for smooth micro-interactions
- **Direct-to-R2 uploads**: No backend bandwidth usage
- **Background processing**: Sharp for images, FFmpeg for videos
- **Multiple variants**: Large, thumbnail, and poster images
- **Cursor-based pagination**: Infinite scroll with stable ordering
- **Rate limiting**: Per event/guest upload limits
- **Photo approval**: Optional moderation workflow
- **Authentication**: JWT-based organizer auth

## Tech Stack

### Backend
- NestJS + TypeScript
- PostgreSQL + Prisma ORM
- BullMQ + Redis (job queue)
- Cloudflare R2 (S3-compatible storage)
- Sharp (image processing)

### Web App
- React 19 + TypeScript
- Vite (build tool)
- React Router v7
- Tailwind CSS
- Zod (validation)

### Marketing Site
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- Server Components

## Environment Variables

### Backend (.env)
```bash
DATABASE_URL="postgresql://..."
REDIS_URL="redis://localhost:6379"
R2_ENDPOINT="https://[account-id].r2.cloudflarestorage.com"
R2_BUCKET="fete-photos"
R2_ACCESS_KEY_ID="..."
R2_SECRET_ACCESS_KEY="..."
R2_PUBLIC_BASE_URL="https://pub-[account-id].r2.dev"
```

### Web App (.env)
```bash
VITE_API_URL=http://localhost:3000
```

### Marketing Site (.env)
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_WEB_APP_URL=http://localhost:5173
```

## Database Schema

Key models:
- **Organizer**: Event creators
- **Event**: Events with unique codes
- **Photo**: Uploaded photos with processing status
- **Template**: Overlay templates for photos
- **ShareBundle**: Curated photo collections

## API Endpoints

### Public
- `GET /events/:code` - Get event details
- `POST /api/upload-intent` - Get presigned upload URL
- `POST /api/upload-complete` - Trigger processing
- `GET /api/events/:code/photos` - List photos (paginated)
- `GET /api/photos/:id` - Get single photo

### Admin (TODO: Add auth)
- `POST /events` - Create event
- `PATCH /photos/:id/approve` - Approve/reject photo

## Development Workflow

### Running Everything
```bash
# Terminal 1: Backend API
cd fete-backend && npm run start:dev

# Terminal 2: Worker
cd fete-backend && npm run start:worker

# Terminal 3: Web App
cd fete-web && npm run dev

# Terminal 4: Marketing Site
cd fete-site && npm run dev

# Terminal 5: Redis (if not running as service)
redis-server
```

### Testing Upload Flow
1. Visit http://localhost:5173
2. Enter code: `AB3X9K`
3. Upload a photo
4. Watch worker logs for processing
5. See photo appear in gallery

## Deployment

### Backend
- Deploy API and Worker as separate processes
- Use managed PostgreSQL (Neon, Supabase, etc.)
- Use managed Redis (Upstash, Redis Cloud, etc.)
- Configure Cloudflare R2 bucket

### Web App
- Build: `npm run build`
- Deploy to Vercel, Netlify, or Cloudflare Pages
- Set `VITE_API_URL` environment variable

### Marketing Site
- Build: `npm run build`
- Deploy to Vercel (recommended for Next.js)
- Set environment variables

## Project Status

### ✅ Completed
- Backend API with upload flow
- Background image/video processing
- Camera-first UI with live templates
- Snapchat-style template swiper
- News feed with likes and trending
- Guest identity system
- Organizer authentication (JWT)
- Event and template management
- Photo approval workflow
- Stories view
- Web app with camera capture
- Marketing site structure

### 📋 Planned
- Photo lightbox/modal
- Comments on posts
- Share links for photos/bundles
- Bulk photo download (ZIP)
- Event analytics dashboard
- Push notifications
- Content moderation tools
- Real-time updates (WebSocket)

## Documentation

### Getting Started
- [Quick Start Guide](QUICK_START.md)
- [Architecture Overview](ARCHITECTURE.md)
- [Services Guide](SERVICES_GUIDE.md)
- [Startup Checklist](STARTUP_CHECKLIST.md)

### Features
- [News Feed Implementation](NEWS_FEED_IMPLEMENTATION.md)
- [Feed Quick Start](FEED_QUICK_START.md)
- [Template System](TEMPLATE_IMPLEMENTATION.md)
- [Video Support](fete-backend/VIDEO_IMPLEMENTATION.md)
- [Organizer UI](ORGANIZER_UI_COMPLETE.md)

### Backend
- [Backend Implementation](fete-backend/IMPLEMENTATION_SUMMARY.md)
- [API Testing Guide](fete-backend/API_TESTING.md)

### Testing
- [Testing Guide](TESTING_GUIDE.md)
- Test Scripts: `test-feed.sh`, `test-auth-flow.sh`, `test-templates.sh`

## License

Private - All Rights Reserved
