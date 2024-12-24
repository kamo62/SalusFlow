# Architecture Overview

## Core Technologies
- Next.js 14 (App Router)
- TypeScript (Strict Mode)
- Supabase (SSR Mode)
- Prisma ORM
- Tailwind CSS
- shadcn/ui

## Project Structure
```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── practices/         # Practice management
│   └── appointments/      # Appointment management
├── components/            
│   ├── appointments/      # Appointment components
│   ├── dashboard/         # Dashboard components
│   ├── practices/         # Practice components
│   └── ui/                # Reusable UI components
├── lib/
│   ├── appointment/       # Appointment logic
│   ├── auth/             # Authentication (Supabase SSR)
│   ├── practice/         # Practice management
│   └── utils/            # Utility functions
└── middleware.ts         # Auth middleware
```

## Authentication
- Supabase Auth with SSR mode
- Server-side session validation
- Role-based access control
- Practice-based authorization
- Middleware protection

## Database
- PostgreSQL with Prisma ORM
- Supabase for real-time features
- Type-safe queries
- Migrations with Prisma
- Row-level security

## Practice Management
- Multi-practice support
- Role-based permissions
- Doctor management
- Practice settings
- User assignments

## Doctor Management
- Profile management
- Specialization settings
- Consultation fees
- Schedule management
- Practice assignments

## Appointment System
- Calendar integration
- Scheduling logic
- Conflict detection
- Status management
- Notifications

## Error Handling
- React Error Boundaries
- Toast notifications
- Loading states
- Type validation
- API error handling

## State Management
- React Context
- Supabase real-time
- Local storage
- Form state
- Loading state

## Security
- Authentication middleware
- Role-based access
- Environment variables
- Type safety
- Input validation

## Testing
- Unit tests (Jest)
- API tests
- Auth testing
- Database testing
- E2E tests (planned)

## Deployment
- Vercel hosting
- GitHub Actions CI/CD
- Environment management
- Database migrations
- Type generation

## Monitoring
- Error tracking
- Performance monitoring
- Usage analytics
- Audit logging
- Health checks