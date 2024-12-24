import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import path from 'path'

// Load environment variables from the root .env file
config({ path: path.resolve(process.cwd(), '.env') })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL')
}
if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: false,
    },
  }
)

async function testAuth() {
  try {
    // Test login with SuperAdmin
    console.log('\n🔑 Testing SuperAdmin login...')
    const { data: superAdminData, error: superAdminError } = await supabase.auth.signInWithPassword({
      email: 'superadmin@salusflow.co.za',
      password: process.env.TEST_SUPERADMIN_PASSWORD!
    })
    if (superAdminError) throw superAdminError
    console.log('✅ SuperAdmin login successful:', superAdminData.user?.id)
    console.log('Role:', superAdminData.user?.user_metadata.role)

    // Sign out
    await supabase.auth.signOut()

    // Test login with Admin
    console.log('\n🔑 Testing Admin login...')
    const { data: adminData, error: adminError } = await supabase.auth.signInWithPassword({
      email: 'admin@salusflow.co.za',
      password: process.env.TEST_ADMIN_PASSWORD!
    })
    if (adminError) throw adminError
    console.log('✅ Admin login successful:', adminData.user?.id)
    console.log('Role:', adminData.user?.user_metadata.role)

    // Sign out
    await supabase.auth.signOut()

    // Test login with Doctor
    console.log('\n🔑 Testing Doctor login...')
    const { data: doctorData, error: doctorError } = await supabase.auth.signInWithPassword({
      email: 'doctor@salusflow.co.za',
      password: process.env.TEST_DOCTOR_PASSWORD!
    })
    if (doctorError) throw doctorError
    console.log('✅ Doctor login successful:', doctorData.user?.id)
    console.log('Role:', doctorData.user?.user_metadata.role)

    // Sign out
    await supabase.auth.signOut()

    // Test login with regular User
    console.log('\n🔑 Testing User login...')
    const { data: userData, error: userError } = await supabase.auth.signInWithPassword({
      email: 'user@salusflow.co.za',
      password: process.env.TEST_USER_PASSWORD!
    })
    if (userError) throw userError
    console.log('✅ User login successful:', userData.user?.id)
    console.log('Role:', userData.user?.user_metadata.role)

    // Sign out
    await supabase.auth.signOut()

    console.log('\n✨ All authentication tests passed!')
  } catch (error) {
    console.error('❌ Authentication test failed:', error)
    process.exit(1)
  }
}

testAuth() 