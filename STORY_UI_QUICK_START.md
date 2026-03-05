# Story-First UI - Quick Start

## What Changed

Fete now has a **story-first experience** that feels like Instagram/Snapchat Stories:

✨ **Story circles** as the main UI element  
🎨 **Dynamic theming** based on event template colors  
📸 **Floating camera button** always accessible  
🎬 **Immersive story viewer** with tap navigation  
💫 **Smooth animations** at 60fps  

## Quick Test

### 1. Start Services
```bash
./start-all.sh
```

### 2. Create Event with Theme
```bash
# In organizer dashboard, create event with template
# Template config can include theme:
{
  "version": "1.0",
  "theme": {
    "accent": "#FF4D4F",
    "accent2": "#FF2D55",
    "glow": "#7C3AED"
  },
  "overlay": { ... },
  "textFields": [ ... ]
}
```

### 3. Test Guest Flow
1. Go to `http://localhost:5173`
2. Enter event code
3. See story-first page with:
   - Event name + live dot
   - Story circles row
   - Recent moments grid
   - Floating camera button
4. Tap camera button
5. Take photo with template
6. See success toast
7. Tap "My Story" circle
8. View in fullscreen story viewer

## Key Interactions

### Story Viewer
- **Tap left**: Previous story
- **Tap right**: Next story
- **Hold**: Pause story
- **Tap X**: Close viewer

### Story Circles
- **Gradient ring**: New/unviewed stories
- **Gray ring**: Viewed stories
- **"My Story"**: Your own uploads

### Camera Button
- **Tap**: Open camera
- **After upload**: Glows briefly
- **Always visible**: Fixed bottom-right

## Theming

### Default Theme (No Template)
```typescript
{
  accent: '#FF4D4F',      // Red-pink
  accent2: '#FF2D55',     // Pink
  glow: '#7C3AED',        // Purple
  background: '#0E0E11',  // Near black
  text: '#F5F5F5',        // Off white
}
```

### Custom Theme (In Template Config)
Add `theme` object to template config:
```json
{
  "theme": {
    "accent": "#your-color",
    "accent2": "#your-color-2",
    "glow": "#your-glow-color",
    "background": "#your-bg",
    "text": "#your-text"
  }
}
```

The UI will automatically adapt:
- Story rings use accent gradient
- Camera button uses accent gradient
- Live dot uses accent color
- Background uses background color

## File Changes

### New Files
- `src/lib/theme.ts` - Theme utilities
- `src/components/ThemeProvider.tsx` - Theme context
- `src/components/StoryCircle.tsx` - Story circle component
- `src/components/StoryRow.tsx` - Story row container
- `src/components/FloatingCameraButton.tsx` - FAB camera button
- `src/components/RecentMomentsGrid.tsx` - Recent photos grid
- `src/components/Toast.tsx` - Toast notifications
- `src/pages/EventPageStoryFirst.tsx` - New event page

### Updated Files
- `src/pages/HomePage.tsx` - New hero design
- `src/components/StoryViewer.tsx` - Hold to pause, better animations
- `src/App.tsx` - Route to new event page
- `src/index.css` - CSS variables for theming

## Performance

### Bundle Size
- **Total**: 419.70 KB (gzipped: 130.15 KB)
- **CSS**: 30.52 KB (gzipped: 5.82 KB)
- **HTML**: 0.46 KB (gzipped: 0.29 KB)

### Optimizations
- Framer Motion for 60fps animations
- Lazy loading images
- GPU-accelerated transforms
- Code splitting by route
- Minimal re-renders

## Troubleshooting

### Stories not showing
- ✅ Check photos are PROCESSED status
- ✅ Check worker is running
- ✅ Check event code is correct

### Theme not applying
- ✅ Check template has `theme` in config
- ✅ Check CSS variables in DevTools
- ✅ Verify ThemeProvider wraps content

### Animations janky
- ✅ Check GPU acceleration enabled
- ✅ Reduce motion in OS settings
- ✅ Check browser performance

### Camera button not visible
- ✅ Check z-index (should be 40)
- ✅ Check view is 'main' not 'camera' or 'story'
- ✅ Check position: fixed is supported

## Copy Reference

### Home Page
- **Headline**: "Tap in. The event story is live."
- **Subtext**: "Join with a code. Capture with the official frame. Watch it unfold."

### Event Page
- **Header**: "{Event Name}" + live dot
- **Section**: "Live Story"
- **Empty**: "Be the first to post"
- **Toast**: "Posted to story ✅"

## Next Steps

### Backend Enhancements
- [ ] Story grouping by guest
- [ ] Story view tracking
- [ ] Story expiration (24h)
- [ ] Story heads endpoint

### UI Enhancements
- [ ] Story replies
- [ ] Story reactions
- [ ] Story sharing
- [ ] Story highlights

## Comparison: Feed vs Story

| Feature | Feed UI | Story UI |
|---------|---------|----------|
| Primary view | Scrolling feed | Story circles |
| Content type | Permanent posts | Ephemeral stories |
| Interaction | Like/unlike | View/tap through |
| Layout | Vertical scroll | Horizontal + grid |
| Camera access | Bottom nav | Floating button |
| Theming | Static | Dynamic per event |

## Support

For detailed docs, see:
- `STORY_FIRST_UI.md` - Complete implementation guide
- `ARCHITECTURE.md` - System architecture
- `SERVICES_GUIDE.md` - Service dependencies

## Demo Flow

1. **Landing** → Enter code → Animated hero
2. **Event page** → Story circles + recent grid
3. **Tap camera** → Capture with template
4. **Upload** → Success toast + highlight
5. **Tap story** → Fullscreen viewer
6. **Navigate** → Tap left/right, hold to pause
7. **Close** → Back to event page

The experience should feel **fast, native, and cinematic**. 🎬
