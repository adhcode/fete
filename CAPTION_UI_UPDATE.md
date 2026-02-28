# Caption UI Update - Text Icon Toggle

## Changes Made

### Before
- Caption input was always visible in preview screen
- Took up space even when not needed
- Not very Snapchat-like

### After
- Caption input is hidden by default
- Text/chat icon button in top-right corner
- Click icon to show/hide caption input
- Icon highlights when caption input is visible or when caption has text

## UI Layout

```
Preview Screen:
┌─────────────────────────────┐
│ [X]              [Text Icon]│  ← Top bar
│                             │
│                             │
│        Image Preview        │
│                             │
│                      [C]    │  ← Template
│                      [M]    │     selector
│                      [P]    │     (right side)
│                      [X]    │
│                             │
│  [Caption Input (optional)] │  ← Only when text icon clicked
│                             │
│                    [Send →] │  ← Bottom right
└─────────────────────────────┘
```

## Features

1. **Text Icon Button**
   - Located in top-right corner
   - Click to toggle caption input
   - White background when active or has caption
   - Black/transparent when inactive

2. **Caption Input**
   - Only shows when text icon is clicked
   - Auto-focuses when shown
   - 140 character limit
   - Positioned above send button

3. **State Management**
   - `showCaptionInput` state controls visibility
   - Caption persists even when input is hidden
   - Both reset when preview is discarded

## Benefits
- ✅ Cleaner UI - no clutter when caption not needed
- ✅ More Snapchat-like interaction
- ✅ Icon shows if caption exists (white background)
- ✅ Easy to toggle on/off
- ✅ Caption still works exactly the same

## Testing
1. Go to http://localhost:5173/e/AB3X9K
2. Capture or upload an image
3. In preview:
   - Click text icon (top-right) to show caption input
   - Type a caption
   - Click text icon again to hide input (caption persists)
   - Notice icon stays white when caption exists
   - Click send to upload with caption

## Files Modified
- `fete-web/src/components/CameraViewWithTemplate.tsx`
