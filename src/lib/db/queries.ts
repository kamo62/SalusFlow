import { prisma } from '.'
import { getSQLite } from '.'
import { Prisma } from '@prisma/client'

// Appointment queries
export const getAppointmentsByDate = async (date: Date) => {
  // Uses idx_appointments_schedule
  return prisma.appointment.findMany({
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
}

export const getDoctorAppointments = async (doctorId: string, startDate: Date, endDate: Date) => {
  // Uses idx_appointments_doctor and idx_appointments_schedule
  return prisma.appointment.findMany({
    where: {
      doctorId,
      scheduledTime: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      patient: true,
      consultationType: true,
    },
  })
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
        id: { in: busyDoctorIds.map(d => d.doctorId) },
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

// SQLite optimized queries for offline mode
export const getOfflineAppointments = () => {
  const sqlite = getSQLite()
  return sqlite.prepare(`
    SELECT 
      a.*,
      p.full_name as patient_name,
      d.registration_number as doctor_registration,
      ct.name as consultation_type_name
    FROM appointments a
    JOIN patients p ON a.patient_id = p.id
    JOIN doctors d ON a.doctor_id = d.id
    JOIN consultation_types ct ON a.consultation_type_id = ct.id
    WHERE a.scheduled_time >= datetime('now', 'start of day')
    AND a.scheduled_time < datetime('now', '+1 day')
    ORDER BY a.scheduled_time
  `).all()
}

export const searchOfflinePatients = (searchTerm: string) => {
  const sqlite = getSQLite()
  return sqlite.prepare(`
    SELECT 
      p.*,
      d.registration_number as primary_doctor_registration
    FROM patients p
    LEFT JOIN doctors d ON p.primary_doctor_id = d.id
    WHERE p.full_name LIKE ?
    OR p.id_number LIKE ?
    LIMIT 50
  `).all(`%${searchTerm}%`, `%${searchTerm}%`)
}

// Sync queries
export const getPendingSyncItems = () => {
  const sqlite = getSQLite()
  return sqlite.prepare(`
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
  `).all()
}

// Performance monitoring queries
export const getQueryStats = async () => {
  if (process.env.NODE_ENV === 'production') return null
  
  const sqlite = getSQLite()
  return sqlite.prepare(`
    SELECT 
      name as query_name,
      COUNT(*) as execution_count,
      AVG(elapsed_time) as avg_time_ms
    FROM sqlite_stat1
    GROUP BY name
    ORDER BY avg_time_ms DESC
    LIMIT 10
  `).all()
} 