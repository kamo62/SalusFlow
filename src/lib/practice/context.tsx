'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from '@/lib/auth/context'
import { Practice, PracticeContextType } from './types'
import { createBrowserClient } from '@supabase/ssr'

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const PracticeContext = createContext<PracticeContextType>({
  practices: [],
  selectedPractice: null,
  selectPractice: () => {},
  createPractice: async () => null,
  updatePractice: async () => null,
  deletePractice: async () => {},
})

export function PracticeProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [practices, setPractices] = useState<Practice[]>([])
  const [selectedPractice, setSelectedPractice] = useState<Practice | null>(null)

  useEffect(() => {
    if (user) {
      fetchPractices()
    }
  }, [user])

  const fetchPractices = async () => {
    if (!user) return

    const { data: practiceUsers, error: practiceUsersError } = await supabase
      .from('practice_users')
      .select('practice_id')
      .eq('user_id', user.id)

    if (practiceUsersError) {
      console.error('Error fetching practice users:', practiceUsersError)
      return
    }

    const practiceIds = practiceUsers.map(pu => pu.practice_id)

    if (practiceIds.length === 0) return

    const { data: practices, error: practicesError } = await supabase
      .from('practices')
      .select('*')
      .in('id', practiceIds)

    if (practicesError) {
      console.error('Error fetching practices:', practicesError)
      return
    }

    setPractices(practices)
    if (!selectedPractice && practices.length > 0) {
      setSelectedPractice(practices[0])
    }
  }

  const selectPractice = (practiceId: string) => {
    const practice = practices.find(p => p.id === practiceId)
    if (practice) {
      setSelectedPractice(practice)
    }
  }

  const createPractice = async (data: { name: string; ownerId: string }) => {
    if (!user) throw new Error('Not authenticated')

    const { data: practice, error } = await supabase
      .from('practices')
      .insert([{ name: data.name, owner_id: data.ownerId }])
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!practice) {
      throw new Error('No practice returned from creation')
    }

    // Create practice_user entry for owner
    const { error: practiceUserError } = await supabase
      .from('practice_users')
      .insert([{
        practice_id: practice.id,
        user_id: data.ownerId,
        role: 'PRACTICE_ADMIN'
      }])

    if (practiceUserError) {
      throw practiceUserError
    }

    setPractices([...practices, practice])
    return practice
  }

  const updatePractice = async (practiceId: string, data: Partial<Practice>) => {
    if (!user) throw new Error('Not authenticated')

    const { data: practice, error } = await supabase
      .from('practices')
      .update(data)
      .eq('id', practiceId)
      .select()
      .single()

    if (error) {
      throw error
    }

    if (!practice) {
      throw new Error('No practice returned from update')
    }

    setPractices(practices.map(p => p.id === practiceId ? practice : p))
    if (selectedPractice?.id === practiceId) {
      setSelectedPractice(practice)
    }

    return practice
  }

  const deletePractice = async (practiceId: string) => {
    if (!user) throw new Error('Not authenticated')

    const { error } = await supabase
      .from('practices')
      .delete()
      .eq('id', practiceId)

    if (error) {
      throw error
    }

    setPractices(practices.filter(p => p.id !== practiceId))
    if (selectedPractice?.id === practiceId) {
      setSelectedPractice(practices[0] || null)
    }
  }

  return (
    <PracticeContext.Provider
      value={{
        practices,
        selectedPractice,
        selectPractice,
        createPractice,
        updatePractice,
        deletePractice,
      }}
    >
      {children}
    </PracticeContext.Provider>
  )
}

export const usePractice = () => useContext(PracticeContext) 