import { createClient } from '@supabase/supabase-js'
import { ConnectionOptions, DatabaseError } from './types'

function validateEnvironment() {
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!SUPABASE_URL) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is not defined')
  }
  if (!SUPABASE_ANON_KEY) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined')
  }

  return { SUPABASE_URL, SUPABASE_ANON_KEY }
}

const env = validateEnvironment()

export const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  db: {
    schema: 'public'
  },
  global: {
    headers: { 'x-application-name': 'salusflow' }
  }
})

export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('health_check')
      .select('status')
      .single()

    if (error) {
      throw new DatabaseError(
        'Connection check failed',
        'supabase',
        'health_check',
        error
      )
    }

    return !!data
  } catch (error) {
    console.error('Supabase connection check failed:', error)
    return false
  }
}

export async function initSupabase(options: ConnectionOptions = {}): Promise<boolean> {
  if (options.autoConnect) {
    let retries = 0
    const maxRetries = options.maxRetries || 3
    const retryDelay = options.retryDelay || 1000

    while (retries < maxRetries) {
      try {
        if (await checkSupabaseConnection()) {
          return true
        }
      } catch (error) {
        console.error(`Supabase connection attempt ${retries + 1} failed:`, error)
      }

      retries++
      if (retries < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * retries))
      }
    }

    if (!options.retryOnError) {
      throw new DatabaseError(
        'Failed to connect after retries',
        'supabase',
        'init',
        { retries, maxRetries }
      )
    }
  }

  return false
}

export async function getSupabaseStats() {
  try {
    const { data, error } = await supabase
      .from('pg_stat_statements')
      .select(`
        query,
        calls,
        total_exec_time / calls as avg_exec_time,
        rows_per_call
      `)
      .order('total_exec_time', { ascending: false })
      .limit(10)

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to get Supabase stats:', error)
    return null
  }
} 