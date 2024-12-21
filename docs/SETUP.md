# Setup Guide

## Prerequisites
- Node.js (v18 or later)
- pnpm (recommended) or npm
- Git

## Initial Setup

1. Install pnpm if not already installed:
   ```bash
   npm install -g pnpm
   ```

2. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <project-directory>
   ```

3. Install dependencies:
   ```bash
   pnpm install
   ```

4. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

## Environment Variables

Your `.env` should include:
```env
# Database URLs
DATABASE_URL="postgresql://username:password@localhost:5432/practice_management"
DIRECT_URL="postgresql://username:password@localhost:5432/practice_management"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Application Settings
NODE_ENV="development"
```

## Development Workflow

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Run type checking:
   ```bash
   pnpm type-check
   ```

3. Run linting:
   ```bash
   pnpm lint
   ```

4. Format code:
   ```bash
   pnpm format
   ```

## Database Setup

1. Set up Supabase:
   - Create account at [https://supabase.com](https://supabase.com)
   - Create new project
   - Copy Project URL and anon key to `.env`

2. Initialize Prisma:
   ```bash
   pnpm prisma generate
   pnpm prisma migrate dev
   ```

3. (Optional) Open Prisma Studio:
   ```bash
   pnpm prisma studio
   ```

## Common Issues

1. **Node Version**
   - Use Node.js v18 or later
   - Recommended to use nvm for Node.js version management

2. **Package Manager**
   - pnpm is recommended for better performance and disk space usage
   - If using npm, delete pnpm-lock.yaml first

3. **Environment Variables**
   - Ensure all required variables are set in `.env`
   - Check for any missing values

4. **Build Issues**
   - Clear `.next` directory: `pnpm clean`
   - Reinstall dependencies: `pnpm install`

## Scripts

Available npm scripts:
```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
pnpm type-check   # Run TypeScript compiler
pnpm format       # Format code with Prettier
pnpm clean        # Clean build artifacts
```

## VS Code Setup

Recommended extensions:
- ESLint
- Prettier
- Prisma
- Tailwind CSS IntelliSense
- TypeScript and JavaScript

Settings:
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Next Steps

1. Set up your IDE with recommended extensions
2. Familiarize yourself with the project structure
3. Review the documentation in `/docs`
4. Start with the authentication implementation