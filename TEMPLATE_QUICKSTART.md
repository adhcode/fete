# Template System - Quick Start Guide

## 🚀 Get Started in 5 Minutes

### 1. Backend Setup (Already Done ✅)

```bash
cd fete-backend

# Migration applied ✅
# Seed run ✅
# 3 templates created ✅

# Start the server
npm run start:dev
```

### 2. Verify Templates

```bash
# List templates
curl http://localhost:3000/api/templates | jq

# Get specific template
curl http://localhost:3000/api/templates/template-classic | jq

# Check event has template
curl http://localhost:3000/events/AB3X9K | jq '.template'
```

Expected output:
```json
{
  "id": "template-classic",
  "name": "Classic Frame",
  "overlayUrl": "https://pub-xxx.r2.dev/templates/classic/overlay.png",
  "config": { ... }
}
```

### 3. Frontend Setup

```bash
cd fete-web

# Start dev server
npm run dev
```

### 4. Test in Browser

1. Open: http://localhost:5173/e/AB3X9K
2. Allow camera access
3. You should see:
   - Camera feed
   - "Test Event" text at top (white, bold)
   - Template overlay (if overlay PNG exists)

### 5. Capture Photo

1. Click the white circle button
2. Photo preview appears
3. Add caption (optional)
4. Click send arrow (→)
5. Photo uploads with template applied

## 🎨 What You'll See

### Without Overlay PNG
- Event name text overlaid on photo
- White text with drop shadow
- Positioned at top center

### With Overlay PNG
- Transparent frame around photo
- Event name text
- Professional branded look

## 📝 Quick Template Creation

### Create a New Template

```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Template",
    "config": {
      "version": "1.0",
      "overlay": {
        "opacity": 1,
        "blendMode": "normal"
      },
      "textFields": [
        {
          "id": "title",
          "defaultValue": "{{event.name}}",
          "x": 50,
          "y": 10,
          "fontSize": 48,
          "fontFamily": "Arial",
          "fontWeight": "bold",
          "color": "#FFFFFF",
          "align": "center"
        }
      ]
    }
  }'
```

### Assign Template to Event

```bash
# Update event to use template
curl -X PATCH http://localhost:3000/events/AB3X9K \
  -H "Content-Type: application/json" \
  -d '{"templateId": "template-classic"}'
```

## 🐛 Troubleshooting

### Template not showing?
```bash
# Check event has template
curl http://localhost:3000/events/AB3X9K | jq '.templateId'

# Should return: "template-classic"
```

### Text not appearing?
- Check browser console for errors
- Verify event data exists (name, date, etc.)
- Check template config is valid

### Camera not working?
- Allow camera permissions
- Try different browser (Chrome recommended)
- Check HTTPS (required for camera on non-localhost)

## 📊 Test Checklist

- [ ] Backend running on :3000
- [ ] Frontend running on :5173
- [ ] Templates API returns 3 templates
- [ ] Event has template assigned
- [ ] Camera shows live preview
- [ ] Text appears on camera feed
- [ ] Capture photo works
- [ ] Upload includes template
- [ ] Final image has template

## 🎯 Next Steps

1. **Create Overlay PNGs**: See `create-sample-overlays.md`
2. **Upload to R2**: Use AWS CLI or Cloudflare dashboard
3. **Update Template URLs**: Point to actual R2 URLs
4. **Test with Real Photos**: Try different devices
5. **Customize Templates**: Adjust colors, fonts, positions

## 📚 Full Documentation

- **Implementation Guide**: `TEMPLATE_IMPLEMENTATION.md`
- **Summary**: `TEMPLATE_SUMMARY.md`
- **PR Description**: `TEMPLATE_PR.md`
- **Overlay Creation**: `create-sample-overlays.md`

## 💡 Tips

- Templates work even without overlay PNGs (text only)
- Use percentages for positioning (0-100)
- Test with different event names (long/short)
- Check on mobile devices
- Verify EXIF orientation with phone photos

## ✅ Success Criteria

You'll know it's working when:
1. ✅ Camera shows event name overlay
2. ✅ Captured photo includes template
3. ✅ Uploaded photo has template
4. ✅ Text is crisp and readable
5. ✅ Image quality is high

## 🎉 You're Done!

The template system is fully functional. Start capturing photos with branded templates!

**Need Help?**
- Check browser console for errors
- Review backend logs
- See full documentation
- Test with sample templates first
