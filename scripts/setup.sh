#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Setting up Practice Management System...${NC}"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm is not installed. Please install Node.js and npm first.${NC}"
    exit 1
fi

# Check if pnpm is installed, if not install it
if ! command -v pnpm &> /dev/null; then
    echo -e "${BLUE}Installing pnpm...${NC}"
    npm install -g pnpm
fi

# Initialize project if package.json doesn't exist
if [ ! -f package.json ]; then
    echo -e "${BLUE}Initializing new Next.js project...${NC}"
    pnpm create next-app . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
fi

# Install dependencies
echo -e "${BLUE}Installing dependencies...${NC}"
pnpm add @prisma/client @supabase/supabase-js better-sqlite3 crypto
pnpm add -D prisma typescript @types/better-sqlite3 @types/node

# Create necessary directories
echo -e "${BLUE}Creating project structure...${NC}"
mkdir -p src/lib/{db,sync,utils} data migrations/{postgresql,sqlite} prisma/seed

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${BLUE}Creating .env file...${NC}"
    cat > .env << EOL
# Database URLs
DATABASE_URL="postgresql://postgres:password@localhost:5432/practice_management"
DIRECT_URL="postgresql://postgres:password@localhost:5432/practice_management"

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="your-supabase-url"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-supabase-anon-key"

# SQLite Configuration
SQLITE_PATH="./data/practice.db"

# Application Settings
NODE_ENV="development"
EOL
fi

# Create .env.example
cp .env .env.example

# Initialize Prisma
echo -e "${BLUE}Initializing Prisma...${NC}"
pnpm prisma init

# Copy migrations
echo -e "${BLUE}Setting up database migrations...${NC}"
cp migrations/postgresql/0001_initial.up.sql prisma/migrations/
cp migrations/sqlite/0001_initial.up.sql prisma/migrations/

# Update .gitignore
echo -e "${BLUE}Updating .gitignore...${NC}"
cat >> .gitignore << EOL

# Database
/data/*.db
/data/*.db-journal

# Environment
.env
.env*.local

# Prisma
/prisma/migrations/*
!/prisma/migrations/.gitkeep

# Dependencies
node_modules/
.pnpm-store/

# Build
.next/
out/
build/
dist/

# Debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.pnpm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo
EOL

# Create README
echo -e "${BLUE}Creating README...${NC}"
cat > README.md << EOL
# Practice Management System

A medical practice management system with offline-first capabilities.

## Setup

1. Install dependencies:
   \`\`\`bash
   pnpm install
   \`\`\`

2. Configure environment variables:
   - Copy \`.env.example\` to \`.env\`
   - Update the values with your configuration

3. Initialize databases:
   \`\`\`bash
   pnpm prisma migrate dev
   pnpm prisma generate
   \`\`\`

4. Start the development server:
   \`\`\`bash
   pnpm dev
   \`\`\`

## Documentation

- [Architecture](./ARCHITECTURE.md)
- [Database](./DATABASE.md)
- [Documentation](./DOCUMENTATION.md)
- [Roadmap](./ROADMAP.md)

## Development

- \`pnpm dev\`: Start development server
- \`pnpm build\`: Build for production
- \`pnpm start\`: Start production server
- \`pnpm lint\`: Run linter
- \`pnpm test\`: Run tests
EOL

# Initialize Git if not already initialized
if [ ! -d .git ]; then
    echo -e "${BLUE}Initializing Git repository...${NC}"
    git init
    git add .
    git commit -m "Initial commit"
fi

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${BLUE}Next steps:${NC}"
echo "1. Update .env with your Supabase and database credentials"
echo "2. Run 'pnpm prisma migrate dev' to initialize the database"
echo "3. Run 'pnpm dev' to start the development server"
</rewritten_file> 