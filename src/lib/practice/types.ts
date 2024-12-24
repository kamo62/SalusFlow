import { Database } from '../database.types'

export type Practice = Database['public']['Tables']['practices']['Row']

export interface PracticeContextType {
  practices: Practice[]
  selectedPractice: Practice | null
  selectPractice: (practiceId: string) => void
  createPractice: (data: { name: string; ownerId: string }) => Promise<Practice | null>
  updatePractice: (practiceId: string, data: Partial<Practice>) => Promise<Practice | null>
  deletePractice: (practiceId: string) => Promise<void>
} 