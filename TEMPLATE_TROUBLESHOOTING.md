# Template System Troubleshooting

## Issue: Template Not Showing After Upload

### Quick Checks

1. **Open Browser Console** (F12 or Cmd+Option+I)
   - Look for "Template Debug:" log
   - Check for any errors

2. **Verify Event Has Template**
```bash
curl http://localhost:3000/events/AB3X9K | jq '.template'
```

Should return template with `config` and `overlayUrl`.

3. **Check Frontend Logs**
Look for these console messages:
- "Template Debug:" - Shows template configuration
- "Applying template to uploaded image..." - When you upload
- "Template applied successfully" - When it works

### Common Issues

#### 1. Template Not Applied to Uploaded Image

**Symptoms**: Upload image, see original without template

**Solution**: 
- Check browser console for errors
- Verify `hasTemplate` is true in debug log
- Ensure `templateConfig` has textFields

**Fixed in latest code**: Template now works with or without overlay PNG

#### 2. Text Not Showing

**Symptoms**: Image uploads but no text overlay

**Possible Causes**:
- Event data missing (name, date, etc.)
- Text color matches background
- Text positioned off-screen

**Debug**:
```javascript
// In browser console
console.log('Event:', event);
console.log('Template Config:', event.template?.config);
```

#### 3. Overlay Image Not Loading

**Symptoms**: Text shows but no frame/border

**Cause**: Overlay PNG doesn't exist in R2 yet

**Solution**: This is expected! Templates work without overlay images.
- Text-only templates are fully functional
- Overlay is optional enhancement
- See `create-sample-overlays.md` to add overlays

#### 4. Camera Preview Shows Template But Upload Doesn't

**Symptoms**: Live preview works, but uploaded image is plain

**Solution**: Check these logs in console:
```
"Applying template to uploaded image..."
"Template applied successfully"
```

If you see errors, the template composition failed.

### Testing Steps

1. **Test Camera Capture**
   - Go to event page
   - Allow camera
   - Look for event name overlay on camera
   - Capture photo
   - Check preview has template
   - Upload and verify

2. **Test File Upload**
   - Click gallery icon
   - Select an image
   - Should see "Applying template..." in console
   - Preview should show template
   - Upload and verify

3. **Verify Template Data**
```bash
# Check event has template
curl http://localhost:3000/events/AB3X9K | jq '.templateId'

# Check template config
curl http://localhost:3000/api/templates/template-classic | jq '.config.textFields'
```

### Debug Mode

Add this to browser console to see detailed logs:
```javascript
localStorage.setItem('debug', 'template:*');
```

Then refresh the page.

### Expected Behavior

#### With Template (No Overlay PNG)
- ✅ Camera shows event name text
- ✅ Captured photo has text
- ✅ Uploaded image has text
- ❌ No frame/border (overlay doesn't exist)

#### With Template + Overlay PNG
- ✅ Camera shows event name text + frame
- ✅ Captured photo has text + frame
- ✅ Uploaded image has text + frame
- ✅ Professional branded look

### Quick Fixes

#### Fix 1: Restart Backend
```bash
cd fete-backend
npm run start:dev
```

#### Fix 2: Clear Browser Cache
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Or clear cache in DevTools

#### Fix 3: Check Event Data
```bash
curl http://localhost:3000/events/AB3X9K | jq '{name, date, venue, hashtag, templateId}'
```

Ensure event has a name (required for text overlay).

#### Fix 4: Verify Template Config
```bash
curl http://localhost:3000/api/templates/template-classic | jq '.config.textFields[] | {id, defaultValue, x, y}'
```

Should show text field configurations.

### Still Not Working?

1. **Check Browser Console** - Look for red errors
2. **Check Backend Logs** - Look for errors in terminal
3. **Test with Different Image** - Try a simple photo
4. **Try Different Browser** - Chrome recommended
5. **Check Network Tab** - Verify API calls succeed

### Success Indicators

You'll know it's working when you see:

1. **Console Logs**:
```
Template Debug: {hasTemplate: true, textFieldCount: 2, ...}
Applying template to uploaded image...
Template applied successfully
```

2. **Visual Confirmation**:
- Event name appears on image
- Text is white with shadow
- Positioned at top center

3. **Upload Success**:
- Image uploads without errors
- Final image has template applied

### Example Working Flow

```
1. Visit http://localhost:5173/e/AB3X9K
2. Console shows: "Template Debug: {hasTemplate: true, ...}"
3. Click gallery icon
4. Select image
5. Console shows: "Applying template to uploaded image..."
6. Console shows: "Template applied successfully"
7. Preview shows "Test Event" text on image
8. Click send arrow
9. Image uploads with template
```

### Need More Help?

- Check `TEMPLATE_IMPLEMENTATION.md` for technical details
- Review `TEMPLATE_QUICKSTART.md` for setup steps
- See `create-sample-overlays.md` for overlay creation
- Open browser DevTools and check Console + Network tabs

### Known Limitations

- ❌ Videos don't get templates (by design)
- ❌ Overlay PNGs don't exist yet (text-only works)
- ❌ Only system fonts supported (Arial, etc.)
- ✅ Text overlays work perfectly
- ✅ High-quality output
- ✅ EXIF orientation handled
