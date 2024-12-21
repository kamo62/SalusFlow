import { supabase } from '@/lib/auth/supabase'

export interface Practice {
  id: string
  name: string
  practiceNumber: string
  address: string
  phone: string
  email: string
  settings: any
}

export const listPractices = async () => {
  const { data, error } = await supabase
    .from('practices')
    .select('*')
    .order('name')

  if (error) throw error
  return data as Practice[]
}

export const getPracticeById = async (id: string) => {
  const { data, error } = await supabase
    .from('practices')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data as Practice
}

export const createPractice = async (practice: Omit<Practice, 'id'>) => {
  const { data, error } = await supabase
    .from('practices')
    .insert([practice])
    .select()
    .single()

  if (error) throw error
  return data as Practice
}

export const updatePractice = async (id: string, practice: Partial<Practice>) => {
  const { data, error } = await supabase
    .from('practices')
    .update(practice)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Practice
}

export const deletePractice = async (id: string) => {
  const { error } = await supabase
    .from('practices')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export const getUserPractices = async (userId: string) => {
  const { data, error } = await supabase
    .from('practice_users')
    .select(`
      practice:practices (
        id,
        name,
        practiceNumber,
        address,
        phone,
        email,
        settings
      )
    `)
    .eq('user_id', userId)

  if (error) throw error
  return data.map(item => item.practice) as Practice[]
}

export const addUserToPractice = async (
  userId: string,
  practiceId: string,
  role: string
) => {
  const { error } = await supabase
    .from('practice_users')
    .insert([
      {
        user_id: userId,
        practice_id: practiceId,
        role
      }
    ])

  if (error) throw error
}

export const removeUserFromPractice = async (
  userId: string,
  practiceId: string
) => {
  const { error } = await supabase
    .from('practice_users')
    .delete()
    .eq('user_id', userId)
    .eq('practice_id', practiceId)

  if (error) throw error
} 