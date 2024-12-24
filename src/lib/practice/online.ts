import { supabase } from '../db'
import { Practice, SupabasePractice, SupabasePracticeUserResponse, PracticeRole } from './types'

function fromSupabase(practice: SupabasePractice): Practice {
  return {
    id: practice.id,
    name: practice.name,
    practiceNumber: practice.practice_number,
    address: practice.address,
    phone: practice.phone,
    email: practice.email,
    settings: practice.settings
  }
}

export async function getPracticeById(id: string): Promise<Practice> {
  const { data, error } = await supabase
    .from('practices')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return fromSupabase(data as SupabasePractice)
}

export async function createPractice(practice: Omit<Practice, 'id'>): Promise<Practice> {
  // Convert camelCase to snake_case for Supabase
  const supabasePractice = {
    name: practice.name,
    practice_number: practice.practiceNumber,
    address: practice.address,
    phone: practice.phone,
    email: practice.email,
    settings: practice.settings
  }

  const { data, error } = await supabase
    .from('practices')
    .insert([supabasePractice])
    .select()
    .single()

  if (error) throw error
  return fromSupabase(data as SupabasePractice)
}

export async function updatePractice(id: string, practice: Partial<Practice>): Promise<Practice> {
  // Convert camelCase to snake_case for Supabase
  const supabasePractice = {
    ...(practice.name && { name: practice.name }),
    ...(practice.practiceNumber && { practice_number: practice.practiceNumber }),
    ...(practice.address && { address: practice.address }),
    ...(practice.phone && { phone: practice.phone }),
    ...(practice.email && { email: practice.email }),
    ...(practice.settings && { settings: practice.settings })
  }

  const { data, error } = await supabase
    .from('practices')
    .update(supabasePractice)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return fromSupabase(data as SupabasePractice)
}

export async function deletePractice(id: string): Promise<void> {
  const { error } = await supabase
    .from('practices')
    .delete()
    .eq('id', id)

  if (error) throw error
}

export async function getUserPractices(userId: string): Promise<Practice[]> {
  const { data, error } = await supabase
    .from('practice_users')
    .select(`
      practice:practices (
        id,
        name,
        practice_number,
        address,
        phone,
        email,
        settings
      )
    `)
    .eq('user_id', userId)

  if (error) throw error
  
  const typedData = (data as unknown) as SupabasePracticeUserResponse[]
  return typedData.map(item => fromSupabase(item.practice))
}

export async function addUserToPractice(
  userId: string,
  practiceId: string,
  role: PracticeRole
): Promise<void> {
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

export async function removeUserFromPractice(
  userId: string,
  practiceId: string
): Promise<void> {
  const { error } = await supabase
    .from('practice_users')
    .delete()
    .eq('user_id', userId)
    .eq('practice_id', practiceId)

  if (error) throw error
} 