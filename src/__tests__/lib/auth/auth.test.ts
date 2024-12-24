import { supabase } from '@/lib/db/supabase'
import { signIn, signUp, signOut, getCurrentUser, updateUserProfile } from '@/lib/auth'
import { AuthError } from '@/lib/auth/types'

// Mock Supabase auth client
jest.mock('@/lib/db/supabase', () => ({
  supabase: {
    auth: {
      signUp: jest.fn(),
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
      getUser: jest.fn(),
      getSession: jest.fn(),
      updateUser: jest.fn()
    }
  }
}))

describe('Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Sign Up', () => {
    it('should create a new user successfully', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User'
        }
      }

      // Mock successful signup
      ;(supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await signUp({
        email: 'test@example.com',
        password: 'password123',
        fullName: 'Test User'
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUser)
      expect(supabase.auth.signUp).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'password123',
        options: {
          data: {
            full_name: 'Test User'
          }
        }
      })
    })

    it('should handle signup errors', async () => {
      const mockError = new Error('Email already exists')
      ;(supabase.auth.signUp as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: mockError
      })

      const result = await signUp({
        email: 'existing@example.com',
        password: 'password123',
        fullName: 'Test User'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(AuthError)
      expect(result.error?.message).toContain('Email already exists')
    })
  })

  describe('Sign In', () => {
    it('should sign in user successfully', async () => {
      const mockSession = {
        access_token: 'test-token',
        user: {
          id: 'test-id',
          email: 'test@example.com',
          user_metadata: {
            full_name: 'Test User'
          }
        }
      }

      ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { session: mockSession },
        error: null
      })

      const result = await signIn({
        email: 'test@example.com',
        password: 'password123'
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockSession)
    })

    it('should handle invalid credentials', async () => {
      const mockError = new Error('Invalid credentials')
      ;(supabase.auth.signInWithPassword as jest.Mock).mockResolvedValue({
        data: { session: null },
        error: mockError
      })

      const result = await signIn({
        email: 'test@example.com',
        password: 'wrongpassword'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(AuthError)
      expect(result.error?.message).toContain('Invalid credentials')
    })
  })

  describe('Session Management', () => {
    it('should get current user', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User'
        }
      }

      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const user = await getCurrentUser()
      expect(user).toEqual(mockUser)
    })

    it('should handle no current user', async () => {
      ;(supabase.auth.getUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: null
      })

      const user = await getCurrentUser()
      expect(user).toBeNull()
    })
  })

  describe('Profile Management', () => {
    it('should update user profile', async () => {
      const mockUser = {
        id: 'test-id',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Updated Name'
        }
      }

      ;(supabase.auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: mockUser },
        error: null
      })

      const result = await updateUserProfile({
        fullName: 'Updated Name'
      })

      expect(result.success).toBe(true)
      expect(result.data).toEqual(mockUser)
    })

    it('should handle update errors', async () => {
      const mockError = new Error('Update failed')
      ;(supabase.auth.updateUser as jest.Mock).mockResolvedValue({
        data: { user: null },
        error: mockError
      })

      const result = await updateUserProfile({
        fullName: 'Updated Name'
      })

      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(AuthError)
    })
  })

  describe('Sign Out', () => {
    it('should sign out successfully', async () => {
      ;(supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: null
      })

      const result = await signOut()
      expect(result.success).toBe(true)
    })

    it('should handle sign out errors', async () => {
      const mockError = new Error('Sign out failed')
      ;(supabase.auth.signOut as jest.Mock).mockResolvedValue({
        error: mockError
      })

      const result = await signOut()
      expect(result.success).toBe(false)
      expect(result.error).toBeInstanceOf(AuthError)
    })
  })
}) 