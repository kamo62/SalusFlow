const { createClient } = require('@supabase/supabase-js')
const { PrismaClient } = require('@prisma/client')
const dotenv = require('dotenv')

// Load environment variables
dotenv.config()

// Initialize clients
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const prisma = new PrismaClient()

async function testConnections() {
  console.log('Testing connections...\n')

  // Test Supabase
  try {
    const { data, error } = await supabase.auth.getSession()
    if (error) throw error
    console.log('✅ Supabase connection successful')
  } catch (error) {
    console.error('❌ Supabase connection failed:', error)
  }

  // Test Prisma/PostgreSQL
  try {
    await prisma.$queryRaw`SELECT 1`
    console.log('✅ PostgreSQL connection successful')
  } catch (error) {
    console.error('❌ PostgreSQL connection failed:', error)
  }

  // Test migrations
  try {
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `
    console.log('\nAvailable tables:', tables)
  } catch (error) {
    console.error('❌ Failed to query tables:', error)
  }

  await prisma.$disconnect()
}

testConnections().catch(console.error) 