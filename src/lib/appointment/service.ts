import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/lib/database.types'

export type AppointmentFilters = {
  practiceId?: string
  practitionerId?: string
  patientId?: string
  startDate?: string
  endDate?: string
  status?: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
}

export type AppointmentWithRelations = Database['public']['Tables']['appointments']['Row'] & {
  practice: Pick<Database['public']['Tables']['practices']['Row'], 'id' | 'name'>
  practitioner: Pick<Database['public']['Tables']['users']['Row'], 'id' | 'name'>
  patient: Pick<Database['public']['Tables']['users']['Row'], 'id' | 'name'>
}

export class AppointmentService {
  private supabase: SupabaseClient<Database>

  constructor(supabase: SupabaseClient<Database>) {
    this.supabase = supabase
  }

  async getAppointments(filters: AppointmentFilters): Promise<AppointmentWithRelations[]> {
    try {
      let query = this.supabase
        .from('appointments')
        .select(`
          *,
          practice:practices(id, name),
          practitioner:users!practitioner_id(id, name),
          patient:users!patient_id(id, name)
        `)

      if (filters.practiceId) {
        query = query.eq('practice_id', filters.practiceId)
      }

      if (filters.practitionerId) {
        query = query.eq('practitioner_id', filters.practitionerId)
      }

      if (filters.patientId) {
        query = query.eq('patient_id', filters.patientId)
      }

      if (filters.startDate) {
        query = query.gte('start_time', filters.startDate)
      }

      if (filters.endDate) {
        query = query.lte('end_time', filters.endDate)
      }

      if (filters.status) {
        query = query.eq('status', filters.status)
      }

      const { data, error } = await query.order('start_time', { ascending: true })

      if (error) throw error

      return data as AppointmentWithRelations[]
    } catch (error) {
      console.error('Error fetching appointments:', error)
      throw error
    }
  }

  async getAppointmentById(id: string): Promise<AppointmentWithRelations> {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .select(`
          *,
          practice:practices(id, name),
          practitioner:users!practitioner_id(id, name),
          patient:users!patient_id(id, name)
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      if (!data) throw new Error('Appointment not found')

      return data as AppointmentWithRelations
    } catch (error) {
      console.error('Error fetching appointment:', error)
      throw error
    }
  }

  async createAppointment(appointment: {
    practitionerId: string
    patientId: string
    startTime: string
    endTime: string
    notes?: string
    practiceId: string
    status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
  }): Promise<AppointmentWithRelations> {
    try {
      // Verify that both practitioner and patient belong to the practice
      const { data: practiceUsers, error: practiceUsersError } = await this.supabase
        .from('practice_users')
        .select('user_id, role')
        .eq('practice_id', appointment.practiceId)
        .in('user_id', [appointment.practitionerId, appointment.patientId])

      if (practiceUsersError) throw practiceUsersError

      const practitioner = practiceUsers.find(pu => pu.user_id === appointment.practitionerId && pu.role === 'PRACTITIONER')
      const patient = practiceUsers.find(pu => pu.user_id === appointment.patientId && pu.role === 'PATIENT')

      if (!practitioner) throw new Error('Practitioner not found in practice')
      if (!patient) throw new Error('Patient not found in practice')

      const { data, error } = await this.supabase
        .from('appointments')
        .insert([
          {
            practitioner_id: appointment.practitionerId,
            patient_id: appointment.patientId,
            start_time: appointment.startTime,
            end_time: appointment.endTime,
            notes: appointment.notes || null,
            practice_id: appointment.practiceId,
            status: appointment.status
          }
        ])
        .select(`
          *,
          practice:practices(id, name),
          practitioner:users!practitioner_id(id, name),
          patient:users!patient_id(id, name)
        `)
        .single()

      if (error) throw error
      if (!data) throw new Error('Failed to create appointment')

      return data as AppointmentWithRelations
    } catch (error) {
      console.error('Error creating appointment:', error)
      throw error
    }
  }

  async updateAppointment(
    id: string,
    updates: Partial<{
      startTime: string
      endTime: string
      notes: string
      status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED'
    }>
  ): Promise<AppointmentWithRelations> {
    try {
      const { data, error } = await this.supabase
        .from('appointments')
        .update({
          start_time: updates.startTime,
          end_time: updates.endTime,
          notes: updates.notes,
          status: updates.status
        })
        .eq('id', id)
        .select(`
          *,
          practice:practices(id, name),
          practitioner:users!practitioner_id(id, name),
          patient:users!patient_id(id, name)
        `)
        .single()

      if (error) throw error
      if (!data) throw new Error('Appointment not found')

      return data as AppointmentWithRelations
    } catch (error) {
      console.error('Error updating appointment:', error)
      throw error
    }
  }

  async deleteAppointment(id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('appointments')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Error deleting appointment:', error)
      throw error
    }
  }
} 