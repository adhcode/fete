# Creating Sample Overlay Images

Since we can't generate actual PNG files programmatically, here's how to create sample overlays for testing:

## Option 1: Use Online Tools

### Canva (Recommended)
1. Go to https://www.canva.com
2. Create custom size: 1080x1920px
3. Design your frame:
   - Add borders/frames
   - Add decorative elements
   - Leave center transparent/clear
4. Download as PNG with transparent background
5. Upload to R2

### Figma
1. Create 1080x1920px frame
2. Design overlay elements
3. Export as PNG
4. Upload to R2

## Option 2: Use Photoshop/GIMP

1. Create new image: 1080x1920px
2. Add transparent layer
3. Design frame elements
4. Save as PNG-24 (with transparency)
5. Upload to R2

## Option 3: Simple Border Frame

For quick testing, create a simple border:

1. Open any image editor
2. Create 1080x1920px canvas
3. Draw a thick border (100px) around edges
4. Make center transparent
5. Add some decorative corners
6. Save as PNG

## Sample Overlay Designs

### Classic Frame
- White border (80px thick)
- Rounded corners
- Subtle gradient
- Top area for event name
- Bottom area for date

### Minimal
- Thin border (20px)
- Clean lines
- Monochrome
- Top bar only

### Party Vibes
- Colorful confetti pattern
- Gradient borders
- Decorative corners
- Fun, vibrant colors

## Uploading to R2

Once you have your PNG files:

```bash
# Using AWS CLI with R2
aws s3 cp classic-overlay.png s3://fete-photos/templates/template-classic/overlay.png \
  --endpoint-url https://[account-id].r2.cloudflarestorage.com \
  --acl public-read

aws s3 cp minimal-overlay.png s3://fete-photos/templates/template-minimal/overlay.png \
  --endpoint-url https://[account-id].r2.cloudflarestorage.com \
  --acl public-read

aws s3 cp party-overlay.png s3://fete-photos/templates/template-party/overlay.png \
  --endpoint-url https://[account-id].r2.cloudflarestorage.com \
  --acl public-read
```

## Testing Without Overlays

The system works even without overlay images! The text fields will still be applied. To test:

1. Start the app
2. Go to event page
3. Capture a photo
4. You'll see the event name and date overlaid on the photo
5. The overlay PNG is optional

## Quick Test Overlay

For immediate testing, you can use any transparent PNG from the internet:

```bash
# Download a sample transparent frame
curl -o test-overlay.png https://example.com/transparent-frame.png

# Upload to R2
aws s3 cp test-overlay.png s3://fete-photos/templates/template-classic/overlay.png \
  --endpoint-url https://[account-id].r2.cloudflarestorage.com
```

## Preview Images

Create preview images (1080x1920px JPEGs) showing what the template looks like:

1. Take a sample photo
2. Apply the template
3. Save as JPEG
4. Upload to R2 as `preview.jpg`

```bash
aws s3 cp classic-preview.jpg s3://fete-photos/templates/template-classic/preview.jpg \
  --endpoint-url https://[account-id].r2.cloudflarestorage.com \
  --acl public-read
```

## Important Notes

- Overlay PNGs must be **1080x1920px** (portrait)
- Use **transparent background** (PNG-24)
- Keep file size under **1MB** for fast loading
- Test on actual photos to verify positioning
- Ensure text areas are clear/readable

## Next Steps

1. Create 3 overlay PNGs (classic, minimal, party)
2. Upload to R2 at correct paths
3. Update seed script with actual R2 URLs
4. Test with real photos
5. Iterate on design based on results
