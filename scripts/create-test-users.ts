import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import path from 'path'

// Load environment variables from the root .env file
config({ path: path.resolve(process.cwd(), '.env') })

// Debug: Log environment variables
console.log('Environment variables:')
console.log('NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '[REDACTED]' : 'undefined')
console.log('TEST_SUPERADMIN_PASSWORD:', process.env.TEST_SUPERADMIN_PASSWORD ? '[REDACTED]' : 'undefined')

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing env.SUPABASE_SERVICE_ROLE_KEY')
}

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

async function createUser(email: string, password: string, metadata: { name: string; role: string }) {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  })
  if (error) throw error
  return data
}

async function main() {
  try {
    // Create SuperAdmin user
    console.log('Creating SuperAdmin user...')
    await createUser('superadmin@salusflow.co.za', process.env.TEST_SUPERADMIN_PASSWORD!, {
      name: 'Super Admin',
      role: 'SUPERADMIN',
    })

    // Create Admin user
    console.log('Creating Admin user...')
    await createUser('admin@salusflow.co.za', process.env.TEST_ADMIN_PASSWORD!, {
      name: 'Admin User',
      role: 'ADMIN',
    })

    // Create Doctor user
    console.log('Creating Doctor user...')
    await createUser('doctor@salusflow.co.za', process.env.TEST_DOCTOR_PASSWORD!, {
      name: 'Doctor User',
      role: 'DOCTOR',
    })

    // Create regular user
    console.log('Creating regular user...')
    await createUser('user@salusflow.co.za', process.env.TEST_USER_PASSWORD!, {
      name: 'Regular User',
      role: 'USER',
    })

    console.log('All test users created successfully!')
  } catch (error) {
    console.error('Error creating test users:', error)
    process.exit(1)
  }
}

main() 