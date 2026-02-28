# Fete Web - Product App

Guest-facing photo sharing application built with Vite + React + TypeScript.

## Features

- Event access via shareable codes
- Camera capture and photo upload
- Real-time gallery with infinite scroll
- Direct-to-R2 uploads (no backend bandwidth)
- Mobile-first responsive design

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router v7
- **Styling**: Tailwind CSS
- **Validation**: Zod

## Project Structure

```
src/
├── lib/
│   ├── api.ts          # API client
│   └── storage.ts      # Local storage utilities
├── pages/
│   ├── HomePage.tsx    # Event code entry
│   └── EventPage.tsx   # Upload + gallery
├── components/
│   ├── UploadSection.tsx
│   └── Gallery.tsx
├── App.tsx             # Router setup
└── main.tsx            # Entry point
```

## Setup

```bash
# Install dependencies
npm install

# Configure environment
cp .env.example .env
# Edit .env with your API URL

# Start dev server
npm run dev
```

## Environment Variables

```bash
VITE_API_URL=http://localhost:3000
```

## Routes

- `/` - Home page (enter event code)
- `/e/:code` - Event page (upload + gallery)

## Development

```bash
# Dev server with HMR
npm run dev

# Type checking
npm run build

# Lint
npm run lint
```

## Production Build

```bash
npm run build
npm run preview
```

## API Integration

The app communicates with `fete-backend` API:

1. **Get Event**: `GET /events/:code`
2. **Upload Intent**: `POST /api/upload-intent`
3. **Upload to R2**: `PUT <presigned-url>`
4. **Complete Upload**: `POST /api/upload-complete`
5. **Get Photos**: `GET /api/events/:code/photos`

## Mobile Features

- Camera capture with `capture="environment"` attribute
- Touch-optimized UI
- Responsive grid layout
- Optimized image loading with lazy loading

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Camera API support required for photo capture

## Future Enhancements

- Photo lightbox/modal view
- Share individual photos
- Offline support with service workers
- Push notifications for new photos
- Photo filters/effects
