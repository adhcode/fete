# Git Workflow - Fete Project

## Branch Structure

```
main (production-ready code)
  └── dev (development branch)
       ├── feature/template-system-with-selector ✅ (current work)
       ├── feature/camera-first-ui
       └── feature/* (future features)
```

## Branches Created

### 1. `dev` Branch
- Created from: `main`
- Purpose: Development branch for integrating features before merging to main
- Status: ✅ Created and pushed to origin

### 2. `feature/template-system-with-selector` Branch
- Created from: `dev`
- Purpose: Snapchat-style template system with selector UI
- Status: ✅ Created, committed, and pushed to origin
- Commit: `1869618`

## What Was Pushed

### Backend Changes
- Template CRUD API (`/api/templates`)
- Prisma Template model with `overlayKey` field
- Database migration for template support
- 3 seeded templates (Classic, Minimal, Party)
- Updated EventsService to return `overlayUrl`

### Frontend Changes
- Template compositing library (`fete-web/src/lib/template.ts`)
- CameraViewWithTemplate component with template selector
- Template API methods
- Template types
- Snapchat-style UI:
  - Vertical template selector buttons (C, M, P, X)
  - Text/caption icon toggle
  - Template switching in preview screen

### Documentation
- TEMPLATE_IMPLEMENTATION.md
- TEMPLATE_QUICKSTART.md
- TEMPLATE_SELECTOR_FIX.md
- CAPTION_UI_UPDATE.md
- Plus 7 other template-related docs

### Test Scripts
- test-template-flow.sh
- test-templates.sh

## Recommended Workflow Going Forward

### For New Features
```bash
# 1. Start from dev branch
git checkout dev
git pull origin dev

# 2. Create feature branch
git checkout -b feature/your-feature-name

# 3. Make changes and commit
git add .
git commit -m "feat: your feature description"

# 4. Push feature branch
git push -u origin feature/your-feature-name

# 5. Create PR to merge into dev (not main)
# Review and test in dev

# 6. When dev is stable, create PR from dev to main
```

### For Hotfixes
```bash
# 1. Start from main
git checkout main
git pull origin main

# 2. Create hotfix branch
git checkout -b hotfix/critical-bug-fix

# 3. Fix and commit
git add .
git commit -m "fix: critical bug description"

# 4. Push and create PR to main
git push -u origin hotfix/critical-bug-fix
```

## Current Status

- ✅ `main` branch: Production-ready code
- ✅ `dev` branch: Created and ready for feature integration
- ✅ `feature/template-system-with-selector`: Pushed and ready for PR

## Next Steps

1. **Test the feature branch locally**
   ```bash
   git checkout feature/template-system-with-selector
   # Test thoroughly
   ```

2. **Create PR to merge into `dev`**
   - Go to: https://github.com/adhcode/fete/pull/new/feature/template-system-with-selector
   - Base: `dev` (not main!)
   - Compare: `feature/template-system-with-selector`
   - Review changes
   - Merge when ready

3. **Test in `dev` branch**
   ```bash
   git checkout dev
   git pull origin dev
   # Test integrated features
   ```

4. **When ready for production**
   - Create PR from `dev` to `main`
   - Review all changes since last main merge
   - Ensure quality and stability
   - Merge to main

## Benefits of This Workflow

- ✅ `main` stays clean and production-ready
- ✅ `dev` allows testing integrated features
- ✅ Feature branches keep work isolated
- ✅ Easy to review and rollback if needed
- ✅ Clear separation of concerns

## GitHub Links

- Create PR for template feature: https://github.com/adhcode/fete/pull/new/feature/template-system-with-selector
- View all branches: https://github.com/adhcode/fete/branches
- View commits: https://github.com/adhcode/fete/commits
