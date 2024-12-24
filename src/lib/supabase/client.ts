import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          id: string
          practice_id: string
          practitioner_id: string
          patient_id: string
          status_id: string
          type_id: string
          start_time: string
          end_time: string
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          practice_id: string
          practitioner_id: string
          patient_id: string
          status_id: string
          type_id: string
          start_time: string
          end_time: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          practice_id?: string
          practitioner_id?: string
          patient_id?: string
          status_id?: string
          type_id?: string
          start_time?: string
          end_time?: string
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      appointment_statuses: {
        Row: {
          id: string
          practice_id: string
          name: string
          color: string
          is_default: boolean
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          practice_id: string
          name: string
          color: string
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          practice_id?: string
          name?: string
          color?: string
          is_default?: boolean
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      appointment_types: {
        Row: {
          id: string
          practice_id: string
          name: string
          duration: number
          color: string
          is_default: boolean
          is_active: boolean
          price: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          practice_id: string
          name: string
          duration: number
          color: string
          is_default?: boolean
          is_active?: boolean
          price: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          practice_id?: string
          name?: string
          duration?: number
          color?: string
          is_default?: boolean
          is_active?: boolean
          price?: number
          created_at?: string
          updated_at?: string
        }
      }
      patients: {
        Row: {
          id: string
          practice_id: string
          title: string
          first_name: string
          last_name: string
          id_number: string
          date_of_birth: string
          gender: string
          email: string | null
          phone: string | null
          address: string | null
          city: string | null
          postal_code: string | null
          medical_aid_name: string | null
          medical_aid_number: string | null
          medical_aid_plan: string | null
          emergency_contact_name: string | null
          emergency_contact_relationship: string | null
          emergency_contact_phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          practice_id: string
          title: string
          first_name: string
          last_name: string
          id_number: string
          date_of_birth: string
          gender: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          medical_aid_name?: string | null
          medical_aid_number?: string | null
          medical_aid_plan?: string | null
          emergency_contact_name?: string | null
          emergency_contact_relationship?: string | null
          emergency_contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          practice_id?: string
          title?: string
          first_name?: string
          last_name?: string
          id_number?: string
          date_of_birth?: string
          gender?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          city?: string | null
          postal_code?: string | null
          medical_aid_name?: string | null
          medical_aid_number?: string | null
          medical_aid_plan?: string | null
          emergency_contact_name?: string | null
          emergency_contact_relationship?: string | null
          emergency_contact_phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 