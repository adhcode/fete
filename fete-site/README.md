# Fete Site (Marketing & Share Pages)

Next.js marketing site with SEO-optimized share pages for photos and bundles.

## Purpose

This Next.js app handles:
- **Marketing pages**: Home, Features, Pricing, Blog
- **Share pages**: Photo shares (`/p/:photoId`) and bundle shares (`/s/:slug`)
- **SEO & OG tags**: Proper meta tags for social media previews

## Why Next.js?

- Server-side rendering for SEO
- Dynamic OG image generation for shares
- Static generation for marketing pages
- Better performance for public-facing content

## Structure

```
app/
├── page.tsx              # Home page
├── features/page.tsx     # Features page
├── pricing/page.tsx      # Pricing page
├── blog/page.tsx         # Blog listing
├── p/[photoId]/page.tsx  # Single photo share
└── s/[slug]/page.tsx     # Bundle share
```

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_URL=http://localhost:3000
```

For production:
```bash
NEXT_PUBLIC_API_URL=https://api.fete.com
```

## Development

```bash
npm install
npm run dev
```

Visit http://localhost:3001

## Share Pages

### Photo Share (`/p/:photoId`)
- Fetches photo data from API
- Generates OG meta tags with photo image
- Mobile-friendly with share button
- Links back to event gallery

### Bundle Share (`/s/:slug`)
- Fetches bundle with multiple photos
- Grid layout of photos
- OG preview uses first photo
- Share functionality for the bundle

## Image Optimization

Next.js automatically optimizes images from R2. Configure allowed domains in `next.config.ts`:

```typescript
images: {
  remotePatterns: [
    { protocol: "https", hostname: "pub-*.r2.dev" },
  ],
}
```

## Deployment

### Vercel (Recommended)
```bash
vercel
```

### Other Platforms
```bash
npm run build
npm start
```

## SEO Checklist

- [x] Meta titles and descriptions
- [x] OG tags for social sharing
- [x] Twitter card tags
- [x] Semantic HTML
- [x] Mobile responsive
- [ ] Sitemap generation
- [ ] robots.txt
- [ ] Schema.org markup

## Performance

- Static generation for marketing pages
- ISR (60s revalidation) for share pages
- Image optimization via Next.js
- Tailwind CSS for minimal bundle size

## Future Enhancements

- Blog CMS integration (Contentful, Sanity)
- Analytics (Plausible, Fathom)
- A/B testing
- Newsletter signup
- Customer testimonials
