# Story-First UI - Verification Checklist

## Pre-Flight Checks

### Build & Dependencies
- [x] `npm run build` succeeds without errors
- [x] framer-motion installed (v12.34.3)
- [x] All TypeScript errors resolved
- [x] Bundle size reasonable (~420KB, gzipped ~130KB)

### File Structure
- [x] `src/lib/theme.ts` created
- [x] `src/components/ThemeProvider.tsx` created
- [x] `src/components/StoryCircle.tsx` created
- [x] `src/components/StoryRow.tsx` created
- [x] `src/components/FloatingCameraButton.tsx` created
- [x] `src/components/RecentMomentsGrid.tsx` created
- [x] `src/components/Toast.tsx` created
- [x] `src/pages/EventPageStoryFirst.tsx` created
- [x] `src/pages/HomePage.tsx` updated
- [x] `src/components/StoryViewer.tsx` updated
- [x] `src/App.tsx` updated to use new page
- [x] `src/index.css` updated with CSS variables

## Visual Verification

### Home Page
- [ ] Animated gradient background renders
- [ ] Floating orbs animate smoothly
- [ ] Hero text: "Tap in. The event story is live."
- [ ] Code input has backdrop blur
- [ ] Gradient button has hover effect
- [ ] Organizer login link visible
- [ ] Entrance animations smooth (no jank)

### Event Page - Main View
- [ ] Event name displays in header
- [ ] Live dot pulses continuously
- [ ] Story circles row scrolls horizontally
- [ ] "My Story" appears first
- [ ] Story circles have gradient rings (new stories)
- [ ] Story circles have gray rings (viewed stories)
- [ ] Recent moments grid shows 3 columns
- [ ] Recent moments grid shows up to 12 items
- [ ] Empty state shows helpful message
- [ ] Floating camera button visible bottom-right
- [ ] Camera button has gradient background
- [ ] Camera button has glow shadow

### Story Viewer
- [ ] Opens fullscreen on story tap
- [ ] Progress bars show at top
- [ ] Progress animates smoothly
- [ ] Tap left goes to previous
- [ ] Tap right goes to next
- [ ] Hold pauses story (pause icon shows)
- [ ] Release resumes story
- [ ] Close button works (top right)
- [ ] Mute button works for videos (top left)
- [ ] Caption shows at bottom
- [ ] Transitions are smooth (no flicker)
- [ ] Videos autoplay
- [ ] Images show for 5 seconds

### Theming
- [ ] Default theme applies (purple/pink)
- [ ] Custom theme applies from template config
- [ ] Story rings use accent gradient
- [ ] Camera button uses accent gradient
- [ ] Live dot uses accent color
- [ ] Background uses theme background
- [ ] Text uses theme text color
- [ ] CSS variables set correctly in DevTools

## Interaction Verification

### Camera Flow
- [ ] Tap floating camera button opens camera
- [ ] Camera view shows template overlay
- [ ] Can swipe between templates
- [ ] Can capture photo
- [ ] Can add caption
- [ ] Upload shows progress
- [ ] Success toast appears: "Posted to story ✅"
- [ ] Camera button highlights briefly
- [ ] Returns to main view after upload
- [ ] New photo appears in "My Story"
- [ ] New photo appears in recent moments

### Story Navigation
- [ ] Tap story circle opens viewer
- [ ] Tap recent moment opens viewer at that index
- [ ] Viewer shows correct media
- [ ] Can navigate through all stories
- [ ] Last story closes viewer or loads more
- [ ] Close button returns to main view

### Micro-Interactions
- [ ] Story circle scales on tap
- [ ] Camera button scales on tap
- [ ] Recent moment scales on tap
- [ ] Toast fades in smoothly
- [ ] Toast fades out after 3 seconds
- [ ] Live dot pulses continuously
- [ ] Story ring gradient animates
- [ ] Camera button glow pulses on highlight

## Performance Verification

### 60fps Animations
- [ ] Story circle tap scale is smooth
- [ ] Story viewer transitions are smooth
- [ ] Progress bars animate smoothly
- [ ] Live dot pulse is smooth
- [ ] Camera button glow is smooth
- [ ] Toast animations are smooth
- [ ] No dropped frames in DevTools Performance tab

### Loading & Rendering
- [ ] Images lazy load (check Network tab)
- [ ] No layout shift on image load
- [ ] Scroll is smooth (no jank)
- [ ] Initial page load is fast (<2s)
- [ ] Camera opens quickly
- [ ] Story viewer opens instantly

### Bundle Size
- [ ] Total JS < 450KB (gzipped < 140KB)
- [ ] Total CSS < 35KB (gzipped < 6KB)
- [ ] No duplicate dependencies
- [ ] Code splitting works (check Network tab)

## Mobile Verification

### iOS Safari
- [ ] Touch gestures work
- [ ] Swipe to navigate works
- [ ] Hold to pause works
- [ ] Videos autoplay
- [ ] Camera access works
- [ ] No rubber band scrolling issues
- [ ] Safe area insets respected

### Android Chrome
- [ ] Touch gestures work
- [ ] Swipe to navigate works
- [ ] Hold to pause works
- [ ] Videos autoplay
- [ ] Camera access works
- [ ] No scroll issues

### Responsive Design
- [ ] Works on iPhone SE (375px)
- [ ] Works on iPhone 14 Pro (393px)
- [ ] Works on iPad (768px)
- [ ] Works on desktop (1920px)
- [ ] Story circles don't overflow
- [ ] Recent moments grid adapts

## Accessibility Verification

### Keyboard Navigation
- [ ] Can tab through interactive elements
- [ ] Focus visible on all elements
- [ ] Enter/Space activates buttons
- [ ] Escape closes story viewer
- [ ] Arrow keys navigate stories (optional)

### Screen Readers
- [ ] Story circles have aria-labels
- [ ] Camera button has aria-label
- [ ] Close button has aria-label
- [ ] Images have alt text
- [ ] Live region for toast

### Color Contrast
- [ ] Text readable on all backgrounds
- [ ] Meets WCAG AA (4.5:1 for normal text)
- [ ] Meets WCAG AA (3:1 for large text)
- [ ] Focus indicators visible

### Reduced Motion
- [ ] Respects prefers-reduced-motion
- [ ] Animations disabled or reduced
- [ ] Still functional without animations

## Browser Compatibility

### Desktop
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Mobile
- [ ] iOS Safari (14+)
- [ ] Android Chrome (latest)
- [ ] Samsung Internet (latest)

## Edge Cases

### Empty States
- [ ] No stories: Shows "My Story" placeholder
- [ ] No recent moments: Shows helpful message
- [ ] No template: Uses default theme
- [ ] No caption: Story viewer still works

### Error States
- [ ] Event not found: Shows error message
- [ ] Upload fails: Shows error toast
- [ ] Network error: Graceful degradation
- [ ] Invalid event code: Clear error message

### Data States
- [ ] 1 story: Viewer works
- [ ] 100 stories: Performance OK
- [ ] Long captions: Truncate or scroll
- [ ] Large images: Load progressively
- [ ] Slow network: Loading states

## Integration Verification

### Backend Integration
- [ ] GET /events/:code works
- [ ] GET /api/events/:code/story works
- [ ] GET /api/events/:code/photos works
- [ ] POST /api/upload-intent works
- [ ] POST /api/upload-complete works
- [ ] X-Fete-Guest header sent

### Template Integration
- [ ] Template config loads
- [ ] Theme derives from template
- [ ] Overlay applies in camera
- [ ] Text fields render correctly

### Storage Integration
- [ ] Guest ID persists in localStorage
- [ ] Guest ID scoped by event
- [ ] Uploader hash generated
- [ ] Photos tagged with guest ID

## Final Checks

### Code Quality
- [ ] No console errors
- [ ] No console warnings
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] Code is formatted
- [ ] Comments are clear

### Documentation
- [ ] STORY_FIRST_UI.md complete
- [ ] STORY_UI_QUICK_START.md complete
- [ ] README.md updated
- [ ] Inline code comments added

### Deployment Ready
- [ ] Build succeeds
- [ ] All tests pass (if any)
- [ ] Environment variables set
- [ ] Assets optimized
- [ ] Service worker updated (if any)

## Sign-Off

- [ ] Product designer approval
- [ ] Frontend engineer approval
- [ ] QA testing complete
- [ ] Stakeholder demo complete
- [ ] Ready for production

---

## Notes

Use this checklist to verify the story-first UI is production-ready. Check off items as you test them. Any failures should be documented and fixed before deployment.

## Quick Test Script

```bash
# 1. Build
cd fete-web && npm run build

# 2. Start services
cd .. && ./start-all.sh

# 3. Test flow
# - Open http://localhost:5173
# - Enter event code
# - Verify story circles
# - Tap camera button
# - Take photo
# - Verify toast
# - Tap story circle
# - Verify viewer
# - Test navigation
# - Close viewer

# 4. Check DevTools
# - No console errors
# - Performance tab shows 60fps
# - Network tab shows lazy loading
# - CSS variables set correctly
```

## Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Animation Frame Rate**: 60fps

## Accessibility Targets

- **WCAG Level**: AA
- **Color Contrast**: 4.5:1 (normal), 3:1 (large)
- **Keyboard Navigation**: Full support
- **Screen Reader**: Full support
- **Touch Target Size**: 44x44px minimum
