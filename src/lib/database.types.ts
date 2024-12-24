export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          name: string
          avatar_url: string | null
          role: 'PATIENT' | 'PRACTITIONER' | 'PRACTICE_ADMIN' | 'SYSTEM_ADMIN'
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          name: string
          avatar_url?: string | null
          role: 'PATIENT' | 'PRACTITIONER' | 'PRACTICE_ADMIN' | 'SYSTEM_ADMIN'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          name?: string
          avatar_url?: string | null
          role?: 'PATIENT' | 'PRACTITIONER' | 'PRACTICE_ADMIN' | 'SYSTEM_ADMIN'
        }
      }
      practices: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          address: string
          phone: string
          email: string
          website: string | null
          logo_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          address: string
          phone: string
          email: string
          website?: string | null
          logo_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          address?: string
          phone?: string
          email?: string
          website?: string | null
          logo_url?: string | null
        }
      }
      appointments: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          practice_id: string
          practitioner_id: string
          patient_id: string
          start_time: string
          end_time: string
          notes: string | null
          status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          practice_id: string
          practitioner_id: string
          patient_id: string
          start_time: string
          end_time: string
          notes?: string | null
          status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          practice_id?: string
          practitioner_id?: string
          patient_id?: string
          start_time?: string
          end_time?: string
          notes?: string | null
          status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
        }
      }
      practice_users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          practice_id: string
          user_id: string
          role: 'OWNER' | 'ADMIN' | 'PRACTITIONER' | 'PATIENT'
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          practice_id: string
          user_id: string
          role: 'OWNER' | 'ADMIN' | 'PRACTITIONER' | 'PATIENT'
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          practice_id?: string
          user_id?: string
          role?: 'OWNER' | 'ADMIN' | 'PRACTITIONER' | 'PATIENT'
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 