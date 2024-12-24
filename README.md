# Salusflow

A modern healthcare practice management system built with Next.js, TypeScript, and Supabase.

## Features

- **Role-Based Access Control**
  - Patients: Book and manage appointments
  - Practitioners: View and manage their appointments
  - Practice Admins: Manage practitioners, appointments, and practice settings
  - System Admins: Oversee multiple practices and system-wide settings

- **Practice Management**
  - Multi-practice support
  - Practitioner management
  - Working hours configuration
  - Appointment scheduling and management

- **Appointment System**
  - Real-time availability
  - Appointment duration management
  - Automated conflict prevention
  - Status tracking (Scheduled, Completed, Cancelled)

- **User Interface**
  - Modern, responsive design
  - Practice switching for admins
  - Calendar views for appointments
  - Loading states and error handling

## Tech Stack

- Next.js 14 with App Router
- TypeScript
- Supabase (Authentication & Database)
- Prisma ORM
- Tailwind CSS
- shadcn/ui Components

## Getting Started

1. Clone the repository
2. Install dependencies: `pnpm install`
3. Set up environment variables
4. Initialize Supabase: `pnpm supabase init`
5. Run migrations: `pnpm prisma migrate dev`
6. Start development server: `pnpm dev`

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
DATABASE_URL=your_database_url
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit changes
4. Push to the branch
5. Open a pull request

## License

MIT License - see LICENSE file for details 