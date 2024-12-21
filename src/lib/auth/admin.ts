import { supabase } from './supabase'

interface CreateUserParams {
  email: string
  password: string
  metadata: {
    name: string
    idNumber: string
    phone: string
    role: string
    status: string
  }
}

export const createUser = async ({ email, password, metadata }: CreateUserParams) => {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: metadata,
  })

  if (error) throw error
  return data
}

export const resetUserPassword = async (userId: string) => {
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    password: Math.random().toString(36).slice(-12)
  })

  if (error) throw error
  return data
}

export const updateUserRole = async (userId: string, role: string) => {
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    user_metadata: { role }
  })

  if (error) throw error
  return data
}

export const listUsers = async () => {
  const { data, error } = await supabase.auth.admin.listUsers()

  if (error) throw error
  return data
}

export const deleteUser = async (userId: string) => {
  const { data, error } = await supabase.auth.admin.deleteUser(userId)

  if (error) throw error
  return data
} 