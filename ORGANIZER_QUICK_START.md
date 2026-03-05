# 🚀 Organizer UI Quick Start

## Prerequisites

Before starting, ensure you have:
- ✅ Node.js installed
- ✅ Redis running (`redis-server`)
- ✅ PostgreSQL database configured
- ✅ Cloudflare R2 configured
- ✅ Environment variables set

---

## Start the Application

### Option 1: Automated (Recommended)
```bash
# Make sure Redis is running first
redis-server

# Then run the startup script (opens 3 terminals)
./start-all.sh
```

### Option 2: Manual (3 Terminals Required)

```bash
# Terminal 1 - Backend API
cd fete-backend
npm run start:dev

# Terminal 2 - Worker (REQUIRED for photo/video processing!)
cd fete-backend
npm run start:worker

# Terminal 3 - Frontend
cd fete-web
npm run dev
```

**Important:** The worker process is required for:
- Processing uploaded photos
- Generating thumbnails
- Transcoding videos
- Moving photos from PENDING to PROCESSED status

---

## Access the Application

- **Guest Home**: http://localhost:5173
- **Organizer Login**: http://localhost:5173/org/login
- **Organizer Signup**: http://localhost:5173/org/signup

---

## Quick Test Flow

### 1. Create an Organizer Account

1. Go to http://localhost:5173/org/signup
2. Fill in:
   - Name: `Test Organizer`
   - Email: `test@example.com`
   - Password: `password123`
3. Click "Sign Up"
4. You'll be redirected to the dashboard

### 2. Create an Event

1. From dashboard, click "Create Event"
2. Fill in:
   - Event Name: `Summer Party 2026`
   - Date: Select a date
   - Venue: `Beach House`
   - Hashtag: `SummerParty2026`
   - Template: Select "Classic"
   - Check "Public Gallery"
3. Click "Create Event"
4. Note the event code (e.g., `AB3X9K`)
5. Click "Open Guest Link"

### 3. Test Guest Experience

1. The guest link opens in a new tab
2. Swipe left/right to change templates
3. Capture or upload a photo
4. See the template applied
5. Upload the photo

### 4. View Event in Dashboard

1. Go back to dashboard
2. See your event listed with:
   - Event code
   - Venue and date
   - Photo count
   - Template name

### 5. Create a Custom Template

1. From dashboard, click "Create Template"
2. Fill in:
   - Template Name: `My Custom Template`
   - Leave overlay URL empty (optional)
   - Modify JSON config if desired
3. Click "Create Template"
4. Template is now available for new events

---

## Default Templates

The system comes with 3 pre-seeded templates:

1. **Classic** - White text at bottom (y=88%)
2. **Minimal** - Smaller white text (y=90%)
3. **Party** - Colorful text with hashtag (y=85% + 93%)

---

## Template JSON Structure

```json
{
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
      "y": 88,
      "fontSize": 42,
      "fontFamily": "Arial",
      "fontWeight": "bold",
      "color": "#FFFFFF",
      "align": "center",
      "shadow": {
        "offsetX": 2,
        "offsetY": 2,
        "blur": 6,
        "color": "rgba(0,0,0,0.9)"
      }
    }
  ]
}
```

### Template Variables

- `{{event.name}}` - Event name
- `{{event.date}}` - Event date
- `{{event.venue}}` - Event venue
- `{{event.hashtag}}` - Event hashtag

### Positioning

- `x` and `y` are percentages (0-100)
- `y: 88` means 88% from top (near bottom)
- `x: 50` means centered horizontally

---

## Common Tasks

### Logout
1. Click "Logout" in dashboard header
2. You'll be redirected to login page

### View Event Code
1. Go to dashboard
2. Event code is shown in monospace font
3. Click "Open Guest Link" to test

### Check Photo Count
1. Go to dashboard
2. Photo count shown next to each event
3. Updates automatically as guests upload

---

## Troubleshooting

### Can't Login
- Check backend is running on port 3000
- Check JWT_SECRET is set in .env
- Check email/password are correct

### Event Not Found
- Check event code is correct
- Check backend database connection
- Check event was created successfully

### Template Not Showing
- Check template was created successfully
- Check template ID is correct
- Check template config JSON is valid

### Photos Not Uploading
- Check R2 credentials in backend .env
- Check Redis is running
- Check worker process is running

---

## URLs Reference

### Guest URLs
- Home: `http://localhost:5173`
- Event: `http://localhost:5173/e/{CODE}`

### Organizer URLs
- Login: `http://localhost:5173/org/login`
- Signup: `http://localhost:5173/org/signup`
- Dashboard: `http://localhost:5173/org/dashboard`
- New Event: `http://localhost:5173/org/events/new`
- New Template: `http://localhost:5173/org/templates/new`

### API URLs
- Auth: `http://localhost:3000/api/auth/*`
- Events: `http://localhost:3000/events/*`
- Templates: `http://localhost:3000/api/templates/*`
- Uploads: `http://localhost:3000/api/*`

---

## What's Next?

Now that the organizer UI is complete, you can:

1. ✅ Create events with custom settings
2. ✅ Create custom templates
3. ✅ Share event codes with guests
4. ✅ Monitor photo uploads
5. ✅ Manage multiple events

Enjoy using Fete! 🎉
