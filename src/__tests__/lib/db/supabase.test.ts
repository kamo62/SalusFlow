import { supabase, checkSupabaseConnection, initSupabase, getSupabaseStats } from '@/lib/db/supabase'
import { DatabaseError } from '@/lib/db/types'
import { PostgrestQueryBuilder } from '@supabase/postgrest-js'
import { createClient } from '@supabase/supabase-js'

type MockQueryBuilder = PostgrestQueryBuilder<any, any, any, any>

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn((table: string) => ({
      select: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: { status: 'ok' }, error: null })),
        order: jest.fn(() => ({
          limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })) as unknown as MockQueryBuilder
    }))
  }))
}))

describe('Supabase Implementation', () => {
  const originalEnv = process.env

  beforeEach(() => {
    jest.resetModules()
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: 'test-key'
    }
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
  })

  describe('Environment Configuration', () => {
    it('should throw error if SUPABASE_URL is not defined', () => {
      process.env.NEXT_PUBLIC_SUPABASE_URL = undefined
      expect(() => {
        require('@/lib/db/supabase')
      }).toThrow('NEXT_PUBLIC_SUPABASE_URL is not defined')
    })

    it('should throw error if SUPABASE_ANON_KEY is not defined', () => {
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = undefined
      expect(() => {
        require('@/lib/db/supabase')
      }).toThrow('NEXT_PUBLIC_SUPABASE_ANON_KEY is not defined')
    })
  })

  describe('Connection Management', () => {
    it('should check connection successfully', async () => {
      const result = await checkSupabaseConnection()
      expect(result).toBe(true)
    })

    it('should handle connection check failure', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: new Error('Connection failed') })
        })
      }) as unknown as (table: string) => MockQueryBuilder

      jest.spyOn(supabase, 'from').mockImplementation(mockFrom)

      const result = await checkSupabaseConnection()
      expect(result).toBe(false)
    })

    it('should initialize with retry mechanism', async () => {
      const result = await initSupabase({ autoConnect: true, maxRetries: 2 })
      expect(result).toBe(true)
    })

    it('should handle initialization failure with retries', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: new Error('Init failed') })
        })
      }) as unknown as (table: string) => MockQueryBuilder

      jest.spyOn(supabase, 'from').mockImplementation(mockFrom)

      await expect(initSupabase({ 
        autoConnect: true, 
        maxRetries: 2, 
        retryOnError: false 
      })).rejects.toThrow(DatabaseError)
    })
  })

  describe('Performance Monitoring', () => {
    it('should get database stats', async () => {
      const mockStats = [
        { query: 'SELECT', calls: 100, avg_exec_time: 1.5, rows_per_call: 10 }
      ]

      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: mockStats, error: null })
          })
        })
      }) as unknown as (table: string) => MockQueryBuilder

      jest.spyOn(supabase, 'from').mockImplementation(mockFrom)

      const result = await getSupabaseStats()
      expect(result).toEqual(mockStats)
    })

    it('should handle stats retrieval failure', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          order: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue({ data: null, error: new Error('Stats failed') })
          })
        })
      }) as unknown as (table: string) => MockQueryBuilder

      jest.spyOn(supabase, 'from').mockImplementation(mockFrom)

      const result = await getSupabaseStats()
      expect(result).toBeNull()
    })
  })

  describe('Error Handling', () => {
    it('should create proper DatabaseError instances', () => {
      const error = new DatabaseError(
        'Test error',
        'supabase',
        'test_operation',
        { details: 'test' }
      )

      expect(error).toBeInstanceOf(Error)
      expect(error).toBeInstanceOf(DatabaseError)
      expect(error.code).toBe('SUPABASE_TEST_OPERATION_ERROR')
      expect(error.type).toBe('supabase')
      expect(error.operation).toBe('test_operation')
      expect(error.details).toEqual({ details: 'test' })
    })

    it('should handle network errors', async () => {
      const mockFrom = jest.fn().mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockRejectedValue(new Error('Network error'))
        })
      }) as unknown as (table: string) => MockQueryBuilder

      jest.spyOn(supabase, 'from').mockImplementation(mockFrom)

      const result = await checkSupabaseConnection()
      expect(result).toBe(false)
    })
  })
}) 