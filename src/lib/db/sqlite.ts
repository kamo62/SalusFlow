import { Database } from 'better-sqlite3'
import path from 'path'
import { DatabaseConfig, QueryStats } from './types'

const SQLITE_PATH = process.env.SQLITE_PATH || path.join(process.cwd(), 'data', 'practice.db')

let sqlite: Database | null = null

export function getSQLite() {
  if (!sqlite) {
    throw new Error('SQLite database not initialized')
  }
  return sqlite
}

export function initSQLite(config: DatabaseConfig = {}) {
  if (sqlite) return sqlite

  const SQLite = require('better-sqlite3')
  sqlite = new SQLite(SQLITE_PATH, {
    verbose: config.verbose || (process.env.NODE_ENV !== 'production' ? console.log : undefined),
    timeout: config.timeout || 5000,
  })

  return sqlite
}

export function closeSQLite() {
  if (sqlite) {
    sqlite.close()
    sqlite = null
  }
}

export function checkSQLiteConnection(): boolean {
  try {
    const db = getSQLite()
    const result = db.prepare('SELECT 1').get() as { 1: number }
    return result[1] === 1
  } catch (error) {
    console.error('SQLite connection check failed:', error)
    return false
  }
}

export function getQueryStats(): QueryStats[] {
  if (process.env.NODE_ENV === 'production') return []
  
  const db = getSQLite()
  return db.prepare(`
    SELECT 
      name as query_name,
      COUNT(*) as execution_count,
      AVG(elapsed_time) as avg_time_ms
    FROM sqlite_stat1
    GROUP BY name
    ORDER BY avg_time_ms DESC
    LIMIT 10
  `).all() as QueryStats[]
}

export function vacuum(): void {
  const db = getSQLite()
  db.prepare('VACUUM').run()
} 