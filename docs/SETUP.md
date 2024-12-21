# Setup Guide

## Prerequisites
- Node.js 20.x or later
- PNPM (preferred over npm)
- Git

## Initial Setup
1. Clone the repository:
```bash
git clone <repository-url>
cd salusflow
```

2. Install dependencies:
```bash
pnpm install
```

## Environment Setup
1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Fill in the required environment variables in `.env`

## Development
```bash
pnpm dev     # Start development server
pnpm build   # Build for production
pnpm start   # Start production server
```

## Testing
The project uses Jest and React Testing Library for testing.

### Test Structure
```
src/
  __tests__/              # All test files
    components/           # Component tests
    utils/               # Test utilities
    __mocks__/           # Mock files
```

### Running Tests
```bash
pnpm test           # Run tests with coverage
pnpm test:watch     # Run tests in watch mode
pnpm test:ci        # Run tests in CI mode
```

### Writing Tests
- Component tests should be placed in `src/__tests__/components/`
- Use the provided test utilities from `src/__tests__/utils/test-utils.tsx`
- Follow the existing test patterns for consistency

### Test Configuration
- Jest configuration is in `jest.config.ts`
- Test setup is in `jest.setup.ts`
- Mock files are in `src/__tests__/__mocks__/`

## Continuous Integration
The project uses GitHub Actions for CI:
- Runs on push to main and pull requests
- Performs type checking
- Runs linting
- Runs tests
- Builds the project

## Common Issues
If you encounter any issues, try:
1. Clearing the Next.js cache: `pnpm clean`
2. Removing and reinstalling dependencies: `rm -rf node_modules && pnpm install`
3. Checking your Node.js version matches the project requirements