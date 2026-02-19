# Quick Start Guide

Get Fete running locally in 5 minutes.

## Prerequisites

- Node.js 18+ and npm
- PostgreSQL (or use Neon/Supabase)
- Redis
- Cloudflare R2 account (or use MinIO for local dev)

## 1. Clone and Install

```bash
# Install all dependencies
cd fete-backend && npm install && cd ..
cd fete-web && npm install && cd ..
cd fete-site && npm install && cd ..
```

## 2. Setup Backend

```bash
cd fete-backend

# Copy environment file
cp .env.example .env

# Edit .env with your credentials
# DATABASE_URL, REDIS_URL, R2_* variables

# Run migrations
npx prisma migrate dev

# Seed database (creates test event with code AB3X9K)
npm run prisma:seed
```

## 3. Start Services

Open 4 terminal windows:

### Terminal 1: Backend API
```bash
cd fete-backend
npm run start:dev
```
API runs on http://localhost:3000

### Terminal 2: Backend Worker
```bash
cd fete-backend
npm run start:worker
```
Processes uploaded photos in background

### Terminal 3: Product App
```bash
cd fete-web
npm run dev
```
App runs on http://localhost:5173

### Terminal 4: Marketing Site
```bash
cd fete-site
npm run dev
```
Site runs on http://localhost:3001

## 4. Test the Flow

1. Visit http://localhost:5173/e/AB3X9K
2. Click "Upload Photo"
3. Select a photo from your device
4. Add a caption (optional)
5. Click "Upload"
6. Watch it appear in the gallery after processing

## 5. Test Share Pages

1. After uploading a photo, note its ID from the gallery
2. Visit http://localhost:3001/p/[photoId]
3. See the photo with proper OG tags

## Troubleshooting

### "Connection refused" errors
- Make sure PostgreSQL is running
- Make sure Redis is running
- Check DATABASE_URL and REDIS_URL in .env

### Photos not processing
- Check worker logs in Terminal 2
- Verify R2 credentials are correct
- Check Redis connection

### Images not loading
- Verify R2_PUBLIC_BASE_URL is set
- Make sure R2 bucket has public access enabled
- Check browser console for CORS errors

### Port already in use
Change ports in:
- Backend: `src/main.ts` (default 3000)
- Web: `vite.config.ts` (default 5173)
- Site: `package.json` dev script (default 3001)

## Next Steps

- [ ] Enable R2 public access in Cloudflare dashboard
- [ ] Test with real photos from your phone
- [ ] Create additional events
- [ ] Explore approval workflow
- [ ] Test rate limiting
- [ ] Build organizer dashboard

## Production Checklist

Before deploying to production:

- [ ] Add authentication (JWT)
- [ ] Secure organizer-only endpoints
- [ ] Configure CORS properly
- [ ] Set up monitoring (Sentry)
- [ ] Add rate limiting middleware
- [ ] Configure custom R2 domain
- [ ] Set up CI/CD pipeline
- [ ] Add error tracking
- [ ] Configure backups
- [ ] Set up SSL certificates
- [ ] Add analytics
- [ ] Test on mobile devices
- [ ] Load testing
- [ ] Security audit

## Useful Commands

### Backend
```bash
# Generate Prisma client
npx prisma generate

# Create migration
npx prisma migrate dev --name description

# View database
npx prisma studio

# Run tests
npm test
```

### Web App
```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

### Site
```bash
# Build for production
npm run build

# Start production server
npm start

# Type check
npm run type-check
```

## Development Tips

1. **Hot Reload**: All apps support hot reload in dev mode
2. **Database Changes**: Run `npx prisma migrate dev` after schema changes
3. **API Changes**: Backend auto-restarts with `--watch` flag
4. **Debugging**: Use VS Code debugger or `console.log`
5. **Testing**: Write tests as you build features

## Common Issues

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Prisma Client not generated"
```bash
cd fete-backend
npx prisma generate
```

### "Redis connection failed"
```bash
# macOS
brew services start redis

# Linux
sudo systemctl start redis

# Or run manually
redis-server
```

### "Port 3000 already in use"
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 [PID]
```

## Getting Help

- Check `ARCHITECTURE.md` for system overview
- Read `fete-backend/API_TESTING.md` for API docs
- Review `fete-backend/IMPLEMENTATION_SUMMARY.md` for details
- Open an issue on GitHub
