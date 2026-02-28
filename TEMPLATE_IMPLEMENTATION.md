# Template System Implementation Guide

## Overview

This document describes the Snapchat-style template (frame) system implementation for Fete. Templates allow organizers to add branded overlays and dynamic text to event photos.

## Architecture

### Backend (NestJS)

**New Module**: `src/templates/`
- `templates.module.ts` - Module definition
- `templates.controller.ts` - REST API endpoints
- `templates.service.ts` - Business logic
- `dto.ts` - Zod validation schemas

**Database Changes**:
- Updated `Template` model with `overlayKey` field
- Added index on `createdAt`
- Event already has `templateId` relation

**Storage Structure** (R2):
```
templates/
  {templateId}/
    overlay.png    # Transparent PNG overlay
    preview.jpg    # Preview image for selection
```

### Frontend (React + Vite)

**New Files**:
- `src/lib/template.ts` - Template compositing utilities
- `src/components/CameraViewWithTemplate.tsx` - Updated camera with template support

**Updated Files**:
- `src/types/index.ts` - Added Template types
- `src/lib/api.ts` - Added template API methods
- `src/pages/EventPageNew.tsx` - Pass event object to CameraView

## API Endpoints

### GET /api/templates
List all available templates.

**Response**:
```json
[
  {
    "id": "template-classic",
    "name": "Classic Frame",
    "previewUrl": "https://pub-xxx.r2.dev/templates/classic/preview.jpg"
  }
]
```

### GET /api/templates/:id
Get template details including config.

**Response**:
```json
{
  "id": "template-classic",
  "name": "Classic Frame",
  "overlayUrl": "https://pub-xxx.r2.dev/templates/classic/overlay.png",
  "previewUrl": "https://pub-xxx.r2.dev/templates/classic/preview.jpg",
  "config": {
    "version": "1.0",
    "overlay": {
      "opacity": 1,
      "blendMode": "normal"
    },
    "textFields": [
      {
        "id": "eventName",
        "defaultValue": "{{event.name}}",
        "x": 50,
        "y": 10,
        "fontSize": 48,
        "fontFamily": "Arial",
        "fontWeight": "bold",
        "color": "#FFFFFF",
        "align": "center",
        "shadow": {
          "offsetX": 2,
          "offsetY": 2,
          "blur": 4,
          "color": "rgba(0,0,0,0.8)"
        }
      }
    ],
    "safeArea": {
      "top": 15,
      "bottom": 15,
      "left": 5,
      "right": 5
    }
  }
}
```

### POST /api/templates
Create a new template (admin only in production).

**Request**:
```json
{
  "name": "My Template",
  "overlayUrl": "https://pub-xxx.r2.dev/templates/my-template/overlay.png",
  "config": {
    "version": "1.0",
    "overlay": {
      "opacity": 1,
      "blendMode": "normal"
    },
    "textFields": []
  }
}
```

### GET /events/:code
Returns event with template details.

**Response**:
```json
{
  "id": "...",
  "code": "AB3X9K",
  "name": "Summer Party 2026",
  "template": {
    "id": "template-classic",
    "name": "Classic Frame",
    "overlayUrl": "https://...",
    "config": { ... }
  }
}
```

## Template Config Schema

### Coordinate System
- Base resolution: **1080x1920** (portrait)
- All positions are **percentages** (0-100)
- Automatically scales to actual image resolution

### Config Structure

```typescript
{
  version: "1.0",
  
  overlay: {
    url?: string,           // Optional, can be in overlayKey instead
    opacity: number,        // 0-1
    blendMode: "normal" | "multiply" | "screen" | "overlay"
  },
  
  textFields: [
    {
      id: string,           // Unique identifier
      defaultValue: string, // Text with placeholders
      x: number,            // 0-100 (percentage)
      y: number,            // 0-100 (percentage)
      maxWidth?: number,    // Optional max width in pixels
      fontFamily: string,   // e.g., "Arial"
      fontSize: number,     // Base size (scaled automatically)
      fontWeight: string,   // "normal", "bold", "600", etc.
      color: string,        // Hex color "#FFFFFF"
      align: "left" | "center" | "right",
      shadow?: {
        offsetX: number,
        offsetY: number,
        blur: number,
        color: string       // rgba(0,0,0,0.8)
      }
    }
  ],
  
  safeArea?: {
    top: number,            // 0-100 (percentage)
    bottom: number,
    left: number,
    right: number
  }
}
```

### Placeholder Variables

Templates support dynamic text replacement:

- `{{event.name}}` - Event name
- `{{event.date}}` - Event date (formatted)
- `{{event.venue}}` - Event venue
- `{{event.hashtag}}` - Event hashtag

**Example**:
```json
{
  "id": "eventName",
  "defaultValue": "{{event.name}} @ {{event.venue}}"
}
```

## Frontend Implementation

### Template Compositing Flow

1. **Load Event**: Fetch event with template config
2. **Load Overlay**: Preload overlay PNG image
3. **Live Preview**: Draw template on canvas in real-time
4. **Capture**: When user captures photo:
   - Create high-res canvas
   - Draw base image
   - Apply EXIF orientation
   - Draw overlay with blend mode
   - Draw text fields with resolved placeholders
   - Export as JPEG (quality 0.95)
5. **Upload**: Upload composited image to R2

### Key Functions

**`composeImageWithTemplate()`**
```typescript
async function composeImageWithTemplate(
  imageSource: File | Blob,
  templateConfig: TemplateConfig,
  overlayUrl: string | null,
  event: Event,
  options?: { quality?: number; maxWidth?: number }
): Promise<Blob>
```

Composites an image with template overlay and text. Handles:
- EXIF orientation correction
- High-quality scaling
- Overlay blending
- Text rendering with shadows
- Output optimization

**`drawTemplatePreview()`**
```typescript
function drawTemplatePreview(
  canvas: HTMLCanvasElement,
  videoElement: HTMLVideoElement,
  templateConfig: TemplateConfig,
  overlayImage: HTMLImageElement | null,
  event: Event
)
```

Draws live template preview on camera feed.

### Quality Considerations

- **EXIF Orientation**: Automatically corrected
- **Max Resolution**: 2160px width (configurable)
- **JPEG Quality**: 0.95 (high quality)
- **Canvas Smoothing**: High quality enabled
- **Text Rendering**: devicePixelRatio aware
- **Overlay Scaling**: Maintains aspect ratio

## Sample Templates

Three templates are seeded by default:

### 1. Classic Frame
- Event name at top (large, bold, white)
- Event date at bottom (medium, white)
- Drop shadows for readability
- Full opacity overlay

### 2. Minimal
- Event name at top (medium, black)
- 90% opacity overlay
- Clean, simple design

### 3. Party Vibes
- Event name at top (large, magenta)
- Hashtag at bottom (large, yellow)
- Strong shadows
- Vibrant colors

## Creating Custom Templates

### Step 1: Design Overlay PNG

1. Create 1080x1920px transparent PNG
2. Design frame/border elements
3. Leave center area clear for photo
4. Export as PNG with transparency

### Step 2: Upload to R2

```bash
# Upload overlay
aws s3 cp overlay.png s3://fete-photos/templates/my-template/overlay.png \
  --endpoint-url https://[account-id].r2.cloudflarestorage.com

# Upload preview
aws s3 cp preview.jpg s3://fete-photos/templates/my-template/preview.jpg \
  --endpoint-url https://[account-id].r2.cloudflarestorage.com
```

### Step 3: Create Template via API

```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Custom Template",
    "overlayUrl": "https://pub-xxx.r2.dev/templates/my-template/overlay.png",
    "config": {
      "version": "1.0",
      "overlay": {
        "opacity": 1,
        "blendMode": "normal"
      },
      "textFields": [
        {
          "id": "eventName",
          "defaultValue": "{{event.name}}",
          "x": 50,
          "y": 10,
          "fontSize": 48,
          "fontFamily": "Arial",
          "fontWeight": "bold",
          "color": "#FFFFFF",
          "align": "center",
          "shadow": {
            "offsetX": 2,
            "offsetY": 2,
            "blur": 4,
            "color": "rgba(0,0,0,0.8)"
          }
        }
      ]
    }
  }'
```

### Step 4: Assign to Event

```bash
curl -X POST http://localhost:3000/events \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Event",
    "organizerId": "...",
    "templateId": "template-id-here"
  }'
```

## Testing

### Backend Tests

```bash
cd fete-backend

# Test template creation
curl http://localhost:3000/api/templates

# Test template retrieval
curl http://localhost:3000/api/templates/template-classic

# Test event with template
curl http://localhost:3000/events/AB3X9K
```

### Frontend Tests

1. Start backend: `npm run start:dev`
2. Start frontend: `npm run dev`
3. Navigate to event: `http://localhost:5173/e/AB3X9K`
4. Verify template overlay appears on camera
5. Capture photo and verify template is applied
6. Upload and verify final image has template

### Manual Testing Checklist

- [ ] Template overlay loads on camera view
- [ ] Text fields display with correct positioning
- [ ] Placeholders resolve to event data
- [ ] Captured photo includes template
- [ ] Uploaded photo includes template
- [ ] EXIF orientation is correct
- [ ] Image quality is high
- [ ] Text shadows render correctly
- [ ] Overlay blend mode works
- [ ] File upload from gallery applies template

## Performance

### Metrics
- Template overlay load: ~100-300ms
- Image composition: ~500-1500ms (depends on resolution)
- Canvas rendering: 60fps for live preview

### Optimization Tips
- Preload overlay image on event load
- Use requestAnimationFrame for preview
- Limit max output resolution (2160px)
- Cache loaded overlay images
- Use high-quality JPEG compression

## Troubleshooting

### Template not appearing
- Check event has `templateId` set
- Verify overlay URL is accessible
- Check browser console for CORS errors
- Ensure R2 bucket has public access

### Text positioning wrong
- Verify coordinates are 0-100 percentages
- Check base resolution is 1080x1920
- Ensure scaling calculation is correct

### Image quality degraded
- Increase JPEG quality (0.95-0.98)
- Check max output width setting
- Verify canvas smoothing is enabled
- Use high-quality source images

### EXIF orientation issues
- Ensure `getOrientation()` is called
- Verify `applyOrientation()` is applied
- Test with photos from different devices

## Future Enhancements

### Short Term
- [ ] Template preview in event creation
- [ ] Template selection UI for organizers
- [ ] Multiple text field colors
- [ ] Custom font support

### Long Term
- [ ] Visual template editor
- [ ] Template marketplace
- [ ] Animated overlays (GIF/video)
- [ ] User-uploaded templates
- [ ] Template analytics
- [ ] A/B testing templates

## Security Considerations

### Current
- Template config validated with Zod
- File size limits enforced
- Public R2 URLs only

### Production TODO
- [ ] Admin-only template creation
- [ ] Template approval workflow
- [ ] Content moderation for overlays
- [ ] Rate limiting on template API
- [ ] Signed URLs for private templates

## Migration Guide

### Existing Events

Existing events without templates will continue to work normally. To add templates:

1. Run migration: `npx prisma migrate dev`
2. Run seed: `npm run prisma:seed`
3. Update events: `UPDATE "Event" SET "templateId" = 'template-classic' WHERE code = 'AB3X9K'`

### Existing Photos

Photos uploaded before templates were added will not have templates applied. This is expected behavior. Only new photos will have templates.

## Support

For issues or questions:
- Check browser console for errors
- Review backend logs
- Verify R2 bucket configuration
- Test with sample templates first
- Check CORS settings on R2

