export * from './types'
export * from './sqlite'
export * from './supabase'
export * from './prisma'

import { ConnectionStatus } from './types'
import { checkSQLiteConnection } from './sqlite'
import { checkSupabaseConnection } from './supabase'
import { checkPrismaConnection } from './prisma'

export async function checkConnections(): Promise<ConnectionStatus> {
  try {
    const [supabase, sqlite, prisma] = await Promise.all([
      checkSupabaseConnection(),
      checkSQLiteConnection(),
      checkPrismaConnection()
    ])

    return {
      supabase,
      sqlite,
      prisma
    }
  } catch (error) {
    console.error('Connection check failed:', error)
    return {
      supabase: false,
      sqlite: false,
      prisma: false,
      error
    }
  }
} 