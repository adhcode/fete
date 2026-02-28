# Template Selector Fix - Preview Screen

## Problem
When users uploaded/captured an image and tried to switch templates in the preview screen, the template was being applied to an already-composited image (which already had a template on it), causing double-application or incorrect results.

## Solution
Store the original image separately so template switching always applies to the clean, original image.

## Changes Made

### 1. Added Original Image Storage
```typescript
const [originalImage, setOriginalImage] = useState<File | Blob | null>(null);
```

### 2. Updated `capturePhoto()`
- Now stores the original captured blob in `originalImage` state
- Then applies the selected template to create the preview

### 3. Updated `handleFileSelect()`
- Stores the uploaded file in `originalImage` state
- Then applies the selected template to create the preview

### 4. Updated Template Selector in Preview
- Template buttons now apply templates to `originalImage` instead of `previewMedia.file`
- "No Template" button shows the original image without any template
- Each template switch starts fresh from the original image

### 5. Updated `handleDiscardPreview()`
- Clears both `previewMedia` and `originalImage` when discarding

## How It Works Now

1. **User captures/uploads image**
   - Original image stored in `originalImage`
   - Default template applied (if event has one)
   - Result shown in `previewMedia`

2. **User clicks template button (C, M, P)**
   - Template applied to `originalImage` (not the preview)
   - New composited image created
   - Preview updated with new result

3. **User clicks "No Template" (X)**
   - Shows `originalImage` without any template
   - Clean, original photo displayed

4. **User uploads**
   - Whatever is in `previewMedia` gets uploaded
   - This is the final composited image with selected template

## Benefits
- ✅ Template switching works correctly
- ✅ No double-application of templates
- ✅ Users can preview different templates on the same photo
- ✅ "No Template" option shows clean original
- ✅ High quality maintained (always compositing from original)

## Testing
1. Go to http://localhost:5173/e/AB3X9K
2. Upload or capture an image
3. In preview, click different template buttons (C, M, P, X)
4. Verify:
   - Text changes position/style with each template
   - Event name appears at bottom: "Summer Beach Party 2026 🌊"
   - "X" button shows original without template
   - Each switch is smooth and correct

## Files Modified
- `fete-web/src/components/CameraViewWithTemplate.tsx`
