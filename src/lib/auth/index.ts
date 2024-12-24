import { supabase } from '../db/supabase'
import { 
  AuthError, 
  AuthResult, 
  SignUpParams, 
  SignInParams, 
  UpdateProfileParams,
  AuthUser,
  AuthSession
} from './types'

export async function signUp(params: SignUpParams): Promise<AuthResult<AuthUser>> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: {
          full_name: params.fullName
        }
      }
    })

    if (error) {
      return {
        success: false,
        error: new AuthError(error.message, 'SIGNUP_ERROR', error)
      }
    }

    return {
      success: true,
      data: data.user as AuthUser
    }
  } catch (error) {
    return {
      success: false,
      error: new AuthError('Signup failed', 'SIGNUP_ERROR', error)
    }
  }
}

export async function signIn(params: SignInParams): Promise<AuthResult<AuthSession>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password
    })

    if (error) {
      return {
        success: false,
        error: new AuthError(error.message, 'SIGNIN_ERROR', error)
      }
    }

    return {
      success: true,
      data: data.session as AuthSession
    }
  } catch (error) {
    return {
      success: false,
      error: new AuthError('Sign in failed', 'SIGNIN_ERROR', error)
    }
  }
}

export async function signOut(): Promise<AuthResult<void>> {
  try {
    const { error } = await supabase.auth.signOut()

    if (error) {
      return {
        success: false,
        error: new AuthError(error.message, 'SIGNOUT_ERROR', error)
      }
    }

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: new AuthError('Sign out failed', 'SIGNOUT_ERROR', error)
    }
  }
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) {
      return null
    }

    return user as AuthUser
  } catch {
    return null
  }
}

export async function updateUserProfile(params: UpdateProfileParams): Promise<AuthResult<AuthUser>> {
  try {
    const { data, error } = await supabase.auth.updateUser({
      email: params.email,
      password: params.password,
      data: params.fullName ? { full_name: params.fullName } : undefined
    })

    if (error) {
      return {
        success: false,
        error: new AuthError(error.message, 'UPDATE_ERROR', error)
      }
    }

    return {
      success: true,
      data: data.user as AuthUser
    }
  } catch (error) {
    return {
      success: false,
      error: new AuthError('Update failed', 'UPDATE_ERROR', error)
    }
  }
} 