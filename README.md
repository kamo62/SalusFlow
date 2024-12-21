# SalusFlow

A modern practice management system for medical practices in South Africa, built with Next.js 14, TypeScript, and Supabase.

## Quick Start

```bash
# Install pnpm if you haven't already
npm install -g pnpm

# Install dependencies
pnpm install

# Start development server
pnpm dev
```

## Documentation

All project documentation is available in the [docs](./docs) directory:

- [Setup Guide](./docs/SETUP.md) - Get started with development
- [Project Status](./docs/STATUS.md) - Current progress and next steps
- [Architecture](./docs/ARCHITECTURE.md) - System design and decisions
- [Full Documentation](./docs/README.md) - Complete documentation index

## Tech Stack

- **Framework**: Next.js 14
- **Language**: TypeScript
- **Database**: Prisma with Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Authentication**: Supabase Auth
- **State Management**: React Context + Hooks
- **Forms**: React Hook Form
- **Data Fetching**: React Query

## Features

- ⚡️ Next.js 14 with App Router
- 💾 Offline-first architecture
- 🔒 Secure authentication
- 🎨 Modern UI with dark mode
- 📱 Fully responsive design
- 🚀 Optimized performance
- 🔄 Real-time sync capabilities
- 📋 Comprehensive practice management

## Development

```bash
# Start development server
pnpm dev

# Type checking
pnpm type-check

# Linting
pnpm lint

# Formatting
pnpm format
```

## Project Structure

```
salusflow/
├── docs/           # Project documentation
├── src/
│   ├── app/       # Next.js app directory
│   ├── components/# React components
│   ├── lib/       # Utility functions
│   └── types/     # TypeScript types
├── prisma/        # Database schema
└── public/        # Static assets
```

## Contributing

1. Check the [Project Status](./docs/STATUS.md)
2. Follow the [Setup Guide](./docs/SETUP.md)
3. Read our development guidelines
4. Create a new branch
5. Submit a pull request

## License

This project is private and confidential. 