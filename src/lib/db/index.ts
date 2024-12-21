import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'
import { Database } from 'better-sqlite3'
import path from 'path'

// Environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const SQLITE_PATH = process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'practice.db')

// Prisma client with connection pooling
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// Supabase client
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
})

// SQLite connection
let sqlite: Database | null = null

export const getSQLite = () => {
  if (!sqlite) {
    const SQLite = require('better-sqlite3')
    sqlite = new SQLite(SQLITE_PATH, {
      verbose: process.env.NODE_ENV !== 'production' ? console.log : undefined,
    })
  }
  return sqlite
}

// Connection status checker
export const checkConnections = async () => {
  try {
    // Check Supabase
    const { data: supabaseStatus, error: supabaseError } = await supabase
      .from('health_check')
      .select('status')
      .single()

    // Check SQLite
    const sqliteStatus = getSQLite().prepare('SELECT 1').get()

    // Check Prisma
    await prisma.$queryRaw`SELECT 1`

    return {
      supabase: !supabaseError && supabaseStatus,
      sqlite: !!sqliteStatus,
      prisma: true,
    }
  } catch (error) {
    console.error('Connection check failed:', error)
    return {
      supabase: false,
      sqlite: false,
      prisma: false,
      error,
    }
  }
}

// Sync status checker
export const checkSyncStatus = async () => {
  const sqlite = getSQLite()
  try {
    const pendingSync = sqlite
      .prepare('SELECT COUNT(*) as count FROM sync_log WHERE synced = 0')
      .get()
    
    const lastSync = sqlite
      .prepare('SELECT MAX(created_at) as last_sync FROM sync_log WHERE synced = 1')
      .get()

    return {
      pendingChanges: pendingSync.count,
      lastSyncTime: lastSync.last_sync,
    }
  } catch (error) {
    console.error('Sync status check failed:', error)
    return {
      pendingChanges: 0,
      lastSyncTime: null,
      error,
    }
  }
}

// Cleanup function
export const cleanup = () => {
  if (sqlite) {
    sqlite.close()
    sqlite = null
  }
  prisma.$disconnect()
} 