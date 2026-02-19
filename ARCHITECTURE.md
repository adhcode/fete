# Fete Platform Architecture

## Overview

Fete is an event photo sharing platform with three separate applications:

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   fete-site     │     │    fete-web      │     │  fete-backend   │
│   (Next.js)     │────▶│  (Vite + React)  │────▶│    (NestJS)     │
│   Marketing     │     │   Product App    │     │      API        │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                                           │
                                                           ▼
                                                  ┌─────────────────┐
                                                  │   PostgreSQL    │
                                                  │   Redis         │
                                                  │   Cloudflare R2 │
                                                  └─────────────────┘
```

## Applications

### 1. fete-backend (NestJS)
**Purpose**: Core API and background processing

**Tech Stack**:
- NestJS + TypeScript
- PostgreSQL + Prisma ORM
- BullMQ + Redis (job queue)
- Cloudflare R2 (S3-compatible storage)
- Sharp (image processing)

**Responsibilities**:
- Event management
- Photo upload coordination (presigned URLs)
- Background image processing (thumbnails, optimization)
- Photo approval workflow
- Rate limiting
- Public API for photo retrieval

**Processes**:
- API Server (`npm run start:dev`)
- Worker Process (`npm run start:worker`)

**Port**: 3000

---

### 2. fete-web (Vite + React)
**Purpose**: Guest-facing product application

**Tech Stack**:
- Vite + React + TypeScript
- React Router
- TailwindCSS
- Axios/Fetch for API calls

**Routes**:
- `/e/:code` - Event page (camera + upload + gallery)
- `/org` - Organizer dashboard (future)

**Responsibilities**:
- Guest photo upload flow
- Camera integration
- Real-time gallery display
- Event code entry
- Mobile-first experience

**Why Vite?**:
- Fast development experience
- Optimized production builds
- Better for interactive app features
- Smaller bundle size for product app

**Port**: 5173

---

### 3. fete-site (Next.js)
**Purpose**: Marketing site and SEO-optimized share pages

**Tech Stack**:
- Next.js 15 (App Router)
- TypeScript
- TailwindCSS
- Server-side rendering

**Routes**:
- `/` - Home page
- `/features` - Features page
- `/pricing` - Pricing page
- `/blog` - Blog listing
- `/p/:photoId` - Single photo share (OG tags)
- `/s/:slug` - Bundle share (OG tags)

**Responsibilities**:
- SEO-optimized marketing content
- Social media share previews
- Static generation for performance
- ISR for share pages

**Why Next.js?**:
- Server-side rendering for SEO
- Dynamic OG meta tag generation
- Better for content-heavy pages
- Automatic image optimization
- Static generation for marketing pages

**Port**: 3001

---

## Data Flow

### Photo Upload Flow
```
1. Guest visits fete-web (/e/SUMMER24)
2. Guest captures photo with camera
3. fete-web → fete-backend: POST /api/upload-intent
4. fete-backend generates presigned R2 URL
5. fete-web uploads directly to R2 (no API bandwidth)
6. fete-web → fete-backend: POST /api/upload-complete
7. fete-backend queues processing job in Redis
8. Worker process picks up job
9. Worker downloads from R2, creates variants
10. Worker uploads variants back to R2
11. Worker updates database with PROCESSED status
12. fete-web polls/refreshes to show processed photo
```

### Photo Share Flow
```
1. User shares photo link: fete.com/p/abc123
2. fete-site (Next.js) fetches photo data from API
3. Server-side renders page with OG meta tags
4. Social platforms scrape OG tags for preview
5. User clicks link → sees photo on fete-site
6. Can navigate to full event gallery on fete-web
```

---

## Why This Architecture?

### Separation of Concerns
- **fete-backend**: Pure API, no UI concerns
- **fete-web**: Interactive product app, optimized for UX
- **fete-site**: SEO and marketing, optimized for content

### Performance
- **fete-web**: Fast client-side interactions, instant feedback
- **fete-site**: Server-rendered for SEO, cached for speed
- **fete-backend**: Async processing, doesn't block uploads

### SEO Strategy
- Marketing pages (Next.js) rank well in search
- Share pages generate proper OG previews
- Product app (Vite) doesn't need SEO

### Deployment Flexibility
- Backend: Any Node.js host (Railway, Render, Fly.io)
- Web app: Static hosting (Vercel, Netlify, Cloudflare Pages)
- Site: Vercel (optimal for Next.js)

---

## Environment Variables

### fete-backend
```bash
DATABASE_URL=postgresql://...
REDIS_URL=redis://localhost:6379
R2_ENDPOINT=https://[account].r2.cloudflarestorage.com
R2_BUCKET=fete-photos
R2_ACCESS_KEY_ID=...
R2_SECRET_ACCESS_KEY=...
R2_PUBLIC_BASE_URL=https://pub-[account].r2.dev
```

### fete-web
```bash
VITE_API_URL=http://localhost:3000
```

### fete-site
```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

---

## Development Setup

```bash
# Terminal 1: Backend API
cd fete-backend
npm install
npm run start:dev

# Terminal 2: Backend Worker
cd fete-backend
npm run start:worker

# Terminal 3: Product App
cd fete-web
npm install
npm run dev

# Terminal 4: Marketing Site
cd fete-site
npm install
npm run dev

# Terminal 5: Redis (if not running as service)
redis-server
```

---

## Production Deployment

### Backend
```bash
cd fete-backend
npm run build
npm run start:prod      # API server
npm run worker:prod     # Worker (separate process/container)
```

### Web App
```bash
cd fete-web
npm run build
# Deploy dist/ to static hosting
```

### Site
```bash
cd fete-site
npm run build
npm start
# Or deploy to Vercel
```

---

## Future Considerations

### Monorepo
Consider using Turborepo or Nx to manage all three apps:
```
fete/
├── apps/
│   ├── backend/
│   ├── web/
│   └── site/
└── packages/
    ├── types/      # Shared TypeScript types
    └── ui/         # Shared components
```

### API Gateway
Add Kong or similar for:
- Rate limiting
- Authentication
- Request routing
- Analytics

### CDN
- Cloudflare for fete-site and fete-web
- R2 custom domain for photos

### Monitoring
- Sentry for error tracking
- Plausible/Fathom for analytics
- Uptime monitoring

---

## Security Notes

### Current State (MVP)
- No authentication on API endpoints
- Anyone with event code can upload
- Public R2 bucket

### Production TODO
- [ ] JWT authentication
- [ ] Organizer-only endpoints
- [ ] Rate limiting middleware
- [ ] CORS configuration
- [ ] Input sanitization
- [ ] Private R2 with presigned URLs
- [ ] Content moderation (AI)

---

## Tech Stack Summary

| Component | Technology | Purpose |
|-----------|-----------|---------|
| Backend API | NestJS | REST API, business logic |
| Database | PostgreSQL | Persistent data storage |
| ORM | Prisma | Type-safe database access |
| Queue | BullMQ + Redis | Background job processing |
| Storage | Cloudflare R2 | Photo storage (S3-compatible) |
| Image Processing | Sharp | Resize, optimize, convert |
| Product App | Vite + React | Guest upload interface |
| Marketing Site | Next.js | SEO, share pages |
| Styling | TailwindCSS | Utility-first CSS |
| Language | TypeScript | Type safety across stack |

---

## API Endpoints

### Public Endpoints
- `POST /api/upload-intent` - Get presigned URL
- `POST /api/upload-complete` - Trigger processing
- `GET /api/events/:code/photos` - List photos (paginated)
- `GET /api/photos/:id` - Get single photo
- `PATCH /api/photos/:id/approve` - Approve photo (TODO: auth)

### Future Endpoints
- `POST /api/auth/login` - Organizer login
- `POST /api/events` - Create event
- `GET /api/events/:code/analytics` - Event stats
- `POST /api/share/bundle` - Create share bundle
- `GET /api/share/:slug` - Get bundle data

---

## Database Schema

Key models:
- **Organizer**: Event creators
- **Event**: Events with unique codes
- **Photo**: Uploaded photos with processing status
- **ShareBundle**: Curated photo collections
- **Template**: Overlay/branding templates (future)

See `fete-backend/prisma/schema.prisma` for full schema.
