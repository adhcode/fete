# Camera-First UI - Minimalist Guest Experience

## Overview
Complete redesign of the guest experience with instant camera access and minimalist navigation inspired by Snapchat but with a cleaner, more focused approach.

## Key Features

### Instant Camera Access
- Camera starts immediately on page load
- No button clicks required
- Full-screen camera view
- Auto-requests camera permissions

### Three-View Navigation
1. **Gallery** (Left) - Grid view of all photos/videos
2. **Camera** (Center) - Capture photos and videos
3. **Stories** (Right) - Full-screen story feed

### Camera Features
- **Photo Mode**: Tap to capture
- **Video Mode**: Tap to start/stop recording (max 15s)
- **Flip Camera**: Switch between front/back
- **Mode Toggle**: Switch between photo/video
- **Recording Timer**: Shows elapsed time during recording
- **Auto-upload**: Uploads immediately after capture

### Design Principles
- **Black background**: Clean, focused, premium feel
- **Minimal UI**: Only essential controls visible
- **White accents**: High contrast for clarity
- **Smooth transitions**: Between views
- **No clutter**: No unnecessary text or buttons

## UI Layout

```
┌─────────────────────────────────┐
│  ✕  Event Name              🔄  │  ← Top bar (gradient overlay)
│                                 │
│                                 │
│         CAMERA VIEW             │
│      (or Gallery/Stories)       │
│                                 │
│                                 │
│                                 │
│         [Photo] [Video]         │  ← Mode toggle
│              ⚪                  │  ← Capture button
│                                 │
│   📷 Gallery  📸 Camera  ▶️ Stories │  ← Bottom nav
└─────────────────────────────────┘
```

## User Flow

### First Time
1. Enter event code on home page
2. Camera opens immediately
3. Grant camera permission
4. Start capturing

### Capturing
1. Choose Photo or Video mode
2. Tap capture button
3. Auto-uploads in background
4. Continue capturing

### Viewing
1. Tap Gallery icon to see all media
2. Tap Stories icon to view story feed
3. Tap Camera to return to capture

## Technical Implementation

### CameraView Component
- Uses `getUserMedia` API
- MediaRecorder for video capture
- Canvas for photo capture
- Automatic upload after capture
- Error handling for permissions

### EventPageNew Component
- Three-view state management
- Smooth view transitions
- Bottom navigation
- Story viewer integration
- Auto-refresh after upload

### Features
- **Instant camera**: No button clicks
- **Auto-upload**: Background processing
- **Flip camera**: Front/back toggle
- **Recording timer**: 15s countdown
- **Upload feedback**: Loading states
- **Error handling**: Permission denials

## Differences from Snapchat

### What We Kept
- Camera-first approach
- Swipe/tap navigation concept
- Story feed format
- Minimal UI

### What We Changed
- **Simpler navigation**: 3 buttons vs complex gestures
- **Cleaner design**: Less visual noise
- **Focused purpose**: Event photos only
- **No filters**: Pure capture experience
- **No chat**: Just media sharing

## Mobile Optimizations

- Touch-optimized buttons
- Responsive layout
- Proper viewport handling
- Camera orientation support
- Gesture-friendly spacing

## Performance

- Lazy load gallery images
- Efficient video recording
- Background uploads
- Minimal re-renders
- Optimized camera stream

## Browser Support

- Chrome/Edge: Full support
- Safari: Full support
- Firefox: Full support
- Mobile browsers: Optimized

## Future Enhancements

### Short Term
- [ ] Pinch to zoom
- [ ] Flash toggle
- [ ] Grid overlay
- [ ] Timer for photos

### Medium Term
- [ ] Basic filters
- [ ] Stickers/text
- [ ] Crop/rotate
- [ ] Batch upload

### Long Term
- [ ] AR effects
- [ ] Boomerang mode
- [ ] Slow motion
- [ ] Time-lapse

## Accessibility

- High contrast UI
- Large touch targets
- Clear visual feedback
- Error messages
- Loading states

## Testing Checklist

- [ ] Camera permissions work
- [ ] Photo capture works
- [ ] Video recording works (15s limit)
- [ ] Flip camera works
- [ ] Upload completes
- [ ] Gallery loads
- [ ] Stories load
- [ ] Navigation smooth
- [ ] Mobile responsive
- [ ] Error handling

## Known Limitations

- Requires HTTPS (camera API)
- Needs camera permissions
- Video format: WebM (converted to MP4 by backend)
- Max video: 15 seconds
- No offline support yet

## Deployment Notes

- Ensure HTTPS in production
- Test camera permissions flow
- Verify upload endpoints
- Check mobile performance
- Test on various devices

## User Feedback

Expected improvements:
- Faster capture workflow
- More intuitive navigation
- Cleaner, premium feel
- Less friction
- Better mobile experience
