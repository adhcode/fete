## Overview

This PR introduces the foundational backend infrastructure for the Fete event management platform. The implementation provides core functionality for event creation, management, and media handling through a modular NestJS architecture.

## Changes

### Event Management System
- Implemented event CRUD operations with unique code generation
- Added event status tracking (draft, published, archived)
- Created database schema with Prisma ORM for events, uploads, and related entities
- Included seed data for development and testing

### Media Upload Infrastructure
- Built upload service supporting images and videos
- Integrated Cloudinary for cloud storage with automatic optimization
- Added file validation (type, size, dimensions)
- Implemented upload status tracking and metadata storage

### Core Infrastructure
- Set up NestJS project structure with modular architecture
- Configured Prisma with PostgreSQL database
- Added storage abstraction layer for cloud provider flexibility
- Integrated BullMQ for background job processing
- Implemented comprehensive unit tests for controllers and services

### Developer Experience
- Added environment configuration with example file
- Included database seeding for quick local setup
- Configured ESLint and Prettier for code consistency
- Created detailed README with setup instructions

## Technical Details

**Stack:**
- NestJS 10.x
- Prisma ORM
- PostgreSQL
- Cloudinary
- BullMQ + Redis

**Key Features:**
- Unique 6-character event codes with collision handling
- Multi-file upload support with progress tracking
- Automatic image optimization and responsive variants
- Type-safe database queries with Prisma
- Modular service architecture for maintainability

## Testing

All modules include unit tests covering:
- Controller endpoint validation
- Service business logic
- Error handling scenarios
- Edge cases and data validation

Run tests with:
```bash
npm test
```

## Setup Instructions

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables (see `.env.example`)

3. Run database migrations:
```bash
npx prisma migrate dev
```

4. Seed the database:
```bash
npm run seed
```

5. Start the development server:
```bash
npm run start:dev
```

## Next Steps

- Add authentication and authorization
- Implement event participant management
- Add real-time features for live events
- Create admin dashboard endpoints
- Add rate limiting and security middleware

## Notes

This implementation focuses on establishing a solid foundation with clean architecture patterns. The modular structure allows for easy extension and maintenance as the platform grows.
