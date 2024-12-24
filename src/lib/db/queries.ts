import { prisma } from '.'
import { getSQLite } from './index'
import { PrismaClient } from '@prisma/client'
import { isSameDay } from 'date-fns'
import { DatabaseError, QueryStats } from './types'

// Get the inferred types from Prisma
type PrismaAppointment = Awaited<ReturnType<PrismaClient['appointment']['findFirst']>>
type PrismaPatient = Awaited<ReturnType<PrismaClient['patient']['findFirst']>>
type PrismaDoctor = Awaited<ReturnType<PrismaClient['doctor']['findFirst']>>
type PrismaConsultationType = Awaited<ReturnType<PrismaClient['consultationType']['findFirst']>>

// Type definitions
interface QueryResult<T> {
  success: boolean
  data?: T
  error?: DatabaseError
}

interface AppointmentFilters {
  startDate?: Date
  endDate?: Date
  doctorId?: string
  patientId?: string
  status?: string
}

interface AppointmentWithRelations extends PrismaAppointment {
  patient: PrismaPatient
  doctor: PrismaDoctor
  consultationType: PrismaConsultationType
}

interface OfflineAppointment {
  id: string
  patient_name: string
  doctor_registration: string
  consultation_type_name: string
  scheduled_time: string
  status: string
}

interface OfflinePatient {
  id: string
  full_name: string
  id_number: string
  primary_doctor_registration?: string
}

interface SyncItem {
  id: string
  table_name: string
  record_id: string
  operation: string
  data: string
  created_at: string
  has_conflicts: number
}

// Appointment queries
export async function getAppointmentsByDate(
  date: Date
): Promise<QueryResult<AppointmentWithRelations[]>> {
  try {
    const data = await prisma.appointment.findMany({
      where: {
        scheduledTime: {
          gte: date,
          lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
        },
      },
      include: {
        patient: true,
        doctor: true,
        consultationType: true,
      },
    })
    return { success: true, data }
  } catch (error) {
    return {
      success: false,
      error: new DatabaseError(
        'Failed to get appointments',
        'prisma',
        'getAppointmentsByDate',
        error
      )
    }
  }
}

// SQLite optimized queries
export function getOfflineAppointments(
  filters: AppointmentFilters = {}
): QueryResult<OfflineAppointment[]> {
  const db = getSQLite()
  if (!db) {
    throw new DatabaseError(
      'SQLite database not initialized',
      'sqlite',
      'getOfflineAppointments'
    )
  }

  try {
    const params: any[] = []
    let whereClause = 'WHERE 1=1'

    if (filters.startDate) {
      whereClause += ' AND a.scheduled_time >= ?'
      params.push(filters.startDate.toISOString())
    }

    if (filters.endDate) {
      whereClause += ' AND a.scheduled_time < ?'
      params.push(filters.endDate.toISOString())
    }

    if (filters.doctorId) {
      whereClause += ' AND a.doctor_id = ?'
      params.push(filters.doctorId)
    }

    if (filters.status) {
      whereClause += ' AND a.status = ?'
      params.push(filters.status)
    }

    const query = `
      SELECT 
        a.*,
        p.full_name as patient_name,
        d.registration_number as doctor_registration,
        ct.name as consultation_type_name
      FROM appointments a
      JOIN patients p ON a.patient_id = p.id
      JOIN doctors d ON a.doctor_id = d.id
      JOIN consultation_types ct ON a.consultation_type_id = ct.id
      ${whereClause}
      ORDER BY a.scheduled_time
    `

    return {
      success: true,
      data: db.prepare(query).all(...params) as OfflineAppointment[]
    }
  } catch (error) {
    return {
      success: false,
      error: new DatabaseError(
        'Failed to get offline appointments',
        'sqlite',
        'getOfflineAppointments',
        error
      )
    }
  }
}

export function searchOfflinePatients(
  searchTerm: string
): QueryResult<OfflinePatient[]> {
  const db = getSQLite()
  if (!db) {
    throw new DatabaseError(
      'SQLite database not initialized',
      'sqlite',
      'searchOfflinePatients'
    )
  }

  try {
    const query = `
      SELECT 
        p.*,
        d.registration_number as primary_doctor_registration
      FROM patients p
      LEFT JOIN doctors d ON p.primary_doctor_id = d.id
      WHERE p.full_name LIKE ?
      OR p.id_number LIKE ?
      LIMIT 50
    `

    return {
      success: true,
      data: db.prepare(query).all(`%${searchTerm}%`, `%${searchTerm}%`) as OfflinePatient[]
    }
  } catch (error) {
    return {
      success: false,
      error: new DatabaseError(
        'Failed to search offline patients',
        'sqlite',
        'searchOfflinePatients',
        error
      )
    }
  }
}

// Sync queries
export function getPendingSyncItems(): QueryResult<SyncItem[]> {
  const db = getSQLite()
  if (!db) {
    throw new DatabaseError(
      'SQLite database not initialized',
      'sqlite',
      'getPendingSyncItems'
    )
  }

  try {
    const query = `
      SELECT 
        sl.*,
        CASE 
          WHEN sc.id IS NOT NULL THEN 1 
          ELSE 0 
        END as has_conflicts
      FROM sync_log sl
      LEFT JOIN sync_conflicts sc ON sl.id = sc.sync_log_id
      WHERE sl.synced = 0
      ORDER BY sl.created_at
      LIMIT 100
    `

    return {
      success: true,
      data: db.prepare(query).all() as SyncItem[]
    }
  } catch (error) {
    return {
      success: false,
      error: new DatabaseError(
        'Failed to get pending sync items',
        'sqlite',
        'getPendingSyncItems',
        error
      )
    }
  }
}

// Performance monitoring queries
export function getQueryStats(): QueryResult<QueryStats[]> | null {
  if (process.env.NODE_ENV === 'production') return null
  
  const db = getSQLite()
  if (!db) {
    throw new DatabaseError(
      'SQLite database not initialized',
      'sqlite',
      'getQueryStats'
    )
  }

  try {
    const query = `
      SELECT 
        name as query_name,
        COUNT(*) as execution_count,
        AVG(elapsed_time) as avg_time_ms
      FROM sqlite_stat1
      GROUP BY name
      ORDER BY avg_time_ms DESC
      LIMIT 10
    `

    return {
      success: true,
      data: db.prepare(query).all() as QueryStats[]
    }
  } catch (error) {
    return {
      success: false,
      error: new DatabaseError(
        'Failed to get query stats',
        'sqlite',
        'getQueryStats',
        error
      )
    }
  }
}

// Patient queries
export const searchPatients = async (searchTerm: string) => {
  // Uses idx_patients_name and idx_patients_id_number
  return prisma.patient.findMany({
    where: {
      OR: [
        { fullName: { contains: searchTerm, mode: 'insensitive' } },
        { idNumber: { contains: searchTerm } },
      ],
    },
    include: {
      primaryDoctor: {
        include: {
          user: true,
        },
      },
    },
  })
}

export const getPatientHistory = async (patientId: string) => {
  // Uses idx_medical_history_patient
  return prisma.medicalHistory.findMany({
    where: { patientId },
    orderBy: { createdAt: 'desc' },
  })
}

// Doctor queries
export const getAvailableDoctors = async (date: Date) => {
  // Uses idx_doctors_user_id with status check
  const busyDoctorIds = await prisma.appointment.findMany({
    where: {
      scheduledTime: {
        gte: date,
        lt: new Date(date.getTime() + 24 * 60 * 60 * 1000),
      },
    },
    select: { doctorId: true },
  })

  return prisma.doctor.findMany({
    where: {
      status: 'available',
      NOT: {
        id: { in: busyDoctorIds.map((d: { doctorId: string }) => d.doctorId) },
      },
    },
    include: {
      user: true,
      consultationFees: {
        include: {
          consultationType: true,
        },
      },
    },
  })
}

// Consultation queries
export const getDoctorConsultations = async (doctorId: string, startDate: Date, endDate: Date) => {
  // Uses idx_consultations_doctor
  return prisma.consultation.findMany({
    where: {
      doctorId,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      patient: true,
      consultationType: true,
      appointment: true,
    },
  })
}

interface DoctorId {
  doctorId: string
}

interface Doctor {
  id: string
  name: string
}

interface Appointment {
  id: string
  doctorId: string
  date: string
}

export function getBusyDoctors(date: Date) {
  const db = getSQLite()
  if (!db) {
    throw new Error('SQLite database not initialized')
  }

  const appointments = db.prepare(`
    SELECT * FROM appointments
    WHERE DATE(date) = DATE(?)
  `).all(date.toISOString()) as Appointment[]

  const busyDoctorIds = appointments.map((a: Appointment) => ({ doctorId: a.doctorId }))

  const doctors = db.prepare(`
    SELECT * FROM doctors
    WHERE id IN (${busyDoctorIds.map(() => '?').join(',')})
  `).all(...busyDoctorIds.map((d: DoctorId) => d.doctorId)) as Doctor[]

  return doctors
}

export function prepareQuery(query: string) {
  const db = getSQLite()
  if (!db) {
    throw new Error('SQLite database not initialized')
  }
  return db.prepare(query)
}

export function getAppointments() {
  const db = getSQLite()
  if (!db) {
    throw new Error('SQLite database not initialized')
  }
  return db.prepare(`
    SELECT * FROM appointments
    ORDER BY date DESC
  `)
}

export function getPatients() {
  const db = getSQLite()
  if (!db) {
    throw new Error('SQLite database not initialized')
  }
  return db.prepare(`
    SELECT * FROM patients
    ORDER BY name ASC
  `)
}

export function getDoctors() {
  const db = getSQLite()
  if (!db) {
    throw new Error('SQLite database not initialized')
  }
  return db.prepare(`
    SELECT * FROM doctors
    ORDER BY name ASC
  `)
} 