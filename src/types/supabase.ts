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
          email: string
          role: 'USER' | 'DOCTOR' | 'ADMIN' | 'SUPERADMIN'
          name: string
          created_at: string
          updated_at: string
          email_verified: boolean
          phone?: string
          avatar_url?: string
        }
        Insert: {
          email: string
          role?: 'USER' | 'DOCTOR' | 'ADMIN' | 'SUPERADMIN'
          name: string
          phone?: string
          avatar_url?: string
        }
        Update: {
          email?: string
          role?: 'USER' | 'DOCTOR' | 'ADMIN' | 'SUPERADMIN'
          name?: string
          phone?: string
          avatar_url?: string
          email_verified?: boolean
        }
      }
      practices: {
        Row: {
          id: string
          name: string
          practice_number: string
          address: string
          phone: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          name: string
          practice_number: string
          address: string
          phone: string
          email: string
        }
        Update: {
          name?: string
          practice_number?: string
          address?: string
          phone?: string
          email?: string
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
      user_role: 'USER' | 'DOCTOR' | 'ADMIN' | 'SUPERADMIN'
    }
  }
} 