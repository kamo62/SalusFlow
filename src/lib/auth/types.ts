import { User, Session } from '@supabase/supabase-js'

export class AuthError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

export interface AuthResult<T> {
  success: boolean
  data?: T
  error?: AuthError
}

export interface SignUpParams {
  email: string
  password: string
  fullName: string
}

export interface SignInParams {
  email: string
  password: string
}

export interface UpdateProfileParams {
  fullName?: string
  email?: string
  password?: string
}

export interface AuthUser extends User {
  user_metadata: {
    full_name: string
  }
  practiceId?: string
}

export interface AuthSession extends Session {
  user: AuthUser
} 