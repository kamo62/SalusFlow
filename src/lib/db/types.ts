export interface ConnectionStatus {
  supabase: boolean
  sqlite: boolean
  prisma: boolean
  error?: unknown
}

export interface QueryStats {
  query_name: string
  execution_count: number
  avg_time_ms: number
  rows_per_call?: number
}

export interface DatabaseConfig {
  verbose?: boolean
  maxConnections?: number
  timeout?: number
}

export interface ConnectionOptions {
  autoConnect?: boolean
  retryOnError?: boolean
  maxRetries?: number
  retryDelay?: number
}

export type DatabaseType = 'sqlite' | 'supabase' | 'prisma'

export class DatabaseError extends Error {
  constructor(
    message: string,
    public type: DatabaseType,
    public operation: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'DatabaseError'
    this.code = `${type.toUpperCase()}_${operation.toUpperCase()}_ERROR`
  }

  code: string
} 