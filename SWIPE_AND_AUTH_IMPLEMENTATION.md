# Template Swipe + Organizer Auth Implementation

## Part 1: Snapchat-Style Template Swipe ✅

### Dependencies Installed
```bash
cd fete-web
npm install react-swipeable framer-motion
```

### Files Created/Modified

#### 1. `fete-web/src/components/TemplateSwiper.tsx` (NEW)
- Swipeable overlay component for template switching
- Features:
  - Swipe left/right to change templates
  - Keyboard support (arrow keys)
  - Animated name pill (600ms display, fade out)
  - Dots indicator showing current template
  - Touch-action: pan-y to preserve vertical scrolling
  - Desktop mouse drag support

#### 2. `fete-web/src/components/CameraViewWithTemplate.tsx` (MODIFIED)
- Integrated TemplateSwiper component
- Removed old button-based template selector
- Template switching now via swipe gestures
- Maintains WYSIWYG - what you see in camera is what gets uploaded

### How It Works

1. **Swipe Gestures**:
   - Swipe LEFT → Next template
   - Swipe RIGHT → Previous template
   - At first template, swipe right → No template
   - At no template, swipe left → First template

2. **Keyboard Support**:
   - Arrow LEFT → Previous template
   - Arrow RIGHT → Next template

3. **Visual Feedback**:
   - Name pill appears on template change
   - Stays visible for 600ms
   - Smooth fade in/out animation
   - Dots indicator shows position

4. **Performance**:
   - Animations use Framer Motion for 60fps
   - touch-action: pan-y preserves vertical scroll
   - Disabled during upload or camera initialization

---

## Part 2: Organizer Authentication ✅

### Dependencies Installed
```bash
cd fete-backend
npm install @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt
npm install -D @types/passport-jwt @types/bcrypt
```

### Database Changes

#### Prisma Schema Updates
- Added `createdByOrganizerId` to Template model
- Added `createdTemplates` relation to Organizer model
- Migration created: `20260228214118_add_template_creator`

```bash
npx prisma migrate dev --name add_template_creator
```

### Backend Files Created

#### Auth Module (`fete-backend/src/auth/`)

1. **dto.ts** - Type definitions
   - SignupDto, LoginDto schemas (Zod validation)
   - AuthResponse, JwtPayload interfaces

2. **jwt.strategy.ts** - Passport JWT strategy
   - Validates JWT tokens
   - Loads organizer from database
   - Returns user object for @CurrentUser() decorator

3. **jwt-auth.guard.ts** - Global auth guard
   - Protects all routes by default
   - Respects @Public() decorator
   - Uses Passport JWT strategy

4. **public.decorator.ts** - @Public() decorator
   - Marks routes as publicly accessible
   - Used for guest endpoints

5. **current-user.decorator.ts** - @CurrentUser() decorator
   - Extracts authenticated user from request
   - Type-safe access to organizer ID

6. **auth.service.ts** - Business logic
   - signup(): Create organizer with bcrypt password hashing
   - login(): Validate credentials and return JWT
   - getMe(): Get current organizer details
   - Uses bcrypt with 10 rounds for password hashing

7. **auth.controller.ts** - API endpoints
   - POST /api/auth/signup
   - POST /api/auth/login
   - GET /api/auth/me

8. **auth.module.ts** - Module configuration
   - JWT configuration (7-day expiry for MVP)
   - Exports AuthService for use in other modules

### Backend Files Modified

#### 1. `fete-backend/src/app.module.ts`
- Added AuthModule import
- Registered JwtAuthGuard as global APP_GUARD
- All routes now protected by default unless marked @Public()

#### 2. `fete-backend/src/events/events.controller.ts`
- POST /events - Protected, uses @CurrentUser() for organizerId
- GET /events/:code - @Public() for guest access
- GET /events/organizer/my-events - Protected, returns organizer's events

#### 3. `fete-backend/src/events/events.service.ts`
- createEvent() - Enhanced with all event fields
- getOrganizerEvents() - New method to list organizer's events

#### 4. `fete-backend/src/templates/templates.controller.ts`
- GET /api/templates - @Public() (guests can list)
- GET /api/templates/:id - @Public() (guests can view)
- POST /api/templates - Protected, sets createdByOrganizerId
- PATCH /api/templates/:id - Protected, checks ownership
- DELETE /api/templates/:id - Protected, checks ownership

#### 5. `fete-backend/src/templates/templates.service.ts`
- createTemplate() - Accepts organizerId parameter
- updateTemplate() - Checks ownership before update
- deleteTemplate() - Checks ownership before delete
- Throws ForbiddenException if user doesn't own template

#### 6. `fete-backend/src/uploads/uploads.controller.ts`
- Added @Public() decorator to entire controller
- All upload endpoints remain publicly accessible for guests

#### 7. `fete-backend/.env.example`
- Added JWT_SECRET configuration

### Environment Variables

Add to `fete-backend/.env`:
```env
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
```

### API Endpoints

#### Authentication
```
POST /api/auth/signup
Body: { email, password, name? }
Response: { accessToken, organizer: { id, email, name } }

POST /api/auth/login
Body: { email, password }
Response: { accessToken, organizer: { id, email, name } }

GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { id, email, name, createdAt }
```

#### Events (Protected)
```
POST /events
Headers: Authorization: Bearer <token>
Body: { name, date?, venue?, templateId?, hashtag?, approvalRequired?, publicGallery?, allowShareLinks?, maxUploadsPerGuest?, maxUploadsTotal? }
Response: Event object with generated code

GET /events/organizer/my-events
Headers: Authorization: Bearer <token>
Response: Array of organizer's events with photo counts
```

#### Events (Public)
```
GET /events/:code
Response: Event details with template
```

#### Templates (Protected)
```
POST /api/templates
Headers: Authorization: Bearer <token>
Body: { name, config, overlayUrl? }
Response: Template object

PATCH /api/templates/:id
Headers: Authorization: Bearer <token>
Body: { name?, config?, overlayUrl? }
Response: Updated template

DELETE /api/templates/:id
Headers: Authorization: Bearer <token>
Response: { success: true }
```

#### Templates (Public)
```
GET /api/templates
Response: Array of templates (id, name, previewUrl only)

GET /api/templates/:id
Response: Full template with config and overlayUrl
```

### Security Features

1. **Password Security**:
   - bcrypt hashing with 10 rounds
   - Passwords never returned in API responses
   - Constant-time comparison via bcrypt.compare()

2. **JWT Tokens**:
   - 7-day expiry (configurable)
   - Signed with JWT_SECRET
   - Contains minimal payload (sub, email)
   - Validated on every protected request

3. **Authorization**:
   - Global guard protects all routes by default
   - Explicit @Public() decorator for guest routes
   - Ownership checks on template operations
   - organizerId derived from token, not request body

4. **Error Handling**:
   - ConflictException for duplicate emails
   - UnauthorizedException for invalid credentials
   - ForbiddenException for unauthorized operations
   - NotFoundException for missing resources

### Testing

#### Manual Testing with curl

1. **Signup**:
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","name":"Test User"}'
```

2. **Login**:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

3. **Get Current User**:
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

4. **Create Event**:
```bash
curl -X POST http://localhost:3000/events \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{"name":"My Event","venue":"Test Venue","templateId":"template-classic"}'
```

5. **Create Template**:
```bash
curl -X POST http://localhost:3000/api/templates \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "name":"My Template",
    "config":{
      "version":"1.0",
      "overlay":{"opacity":1,"blendMode":"normal"},
      "textFields":[{
        "id":"eventName",
        "defaultValue":"{{event.name}}",
        "x":50,"y":88,
        "fontSize":42,
        "fontFamily":"Arial",
        "fontWeight":"bold",
        "color":"#FFFFFF",
        "align":"center"
      }]
    }
  }'
```

### Migration Steps

1. **Install dependencies**:
```bash
cd fete-backend && npm install
cd ../fete-web && npm install
```

2. **Run migration**:
```bash
cd fete-backend
npx prisma migrate dev
```

3. **Update .env**:
```bash
echo 'JWT_SECRET="your-secret-key-here"' >> .env
```

4. **Start services**:
```bash
# Terminal 1 - Backend
cd fete-backend && npm run start:dev

# Terminal 2 - Frontend
cd fete-web && npm run dev
```

### Future Improvements

1. **Refresh Tokens**: Add refresh token flow for better security
2. **HttpOnly Cookies**: Store tokens in HttpOnly cookies instead of localStorage
3. **Rate Limiting**: Add rate limiting on auth endpoints
4. **Email Verification**: Require email verification on signup
5. **Password Reset**: Add forgot password flow
6. **2FA**: Add two-factor authentication option
7. **Session Management**: Track active sessions and allow revocation
8. **Audit Logging**: Log all auth and ownership changes

### Notes

- Guest flow remains unchanged - no authentication required for uploads
- All existing endpoints continue to work
- Template swipe works on both mobile touch and desktop mouse
- Animations maintain 60fps performance
- JWT tokens stored in memory/localStorage (MVP approach)
- Production should use HttpOnly cookies for better security
