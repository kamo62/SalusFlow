'use client'

import { useState, useEffect } from 'react'
import { Calendar } from '@/components/appointments/calendar'
import { Appointment, AppointmentStatusType } from '@/lib/appointment/types'
import { useAuth } from '@/lib/auth/context'
import { usePractice } from '@/lib/practice/context'
import { ErrorBoundary } from '@/components/error-boundary'
import { Alert, AlertDescription } from '../../components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'

function AppointmentCalendarWithError() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { selectedPractice } = usePractice()
  const practiceId = selectedPractice?.id

  useEffect(() => {
    async function fetchAppointments() {
      if (!practiceId) return

      try {
        const res = await fetch(`/api/appointments?practiceId=${practiceId}`)
        if (!res.ok) throw new Error('Failed to fetch appointments')
        const data = await res.json()
        setAppointments(data)
      } catch (error) {
        throw error // Let error boundary handle it
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [practiceId])

  const handleCreateAppointment = async (date: string, patientId: string) => {
    if (!practiceId) return

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practiceId,
          patientId,
          startTime: date,
          endTime: new Date(new Date(date).getTime() + 30 * 60000).toISOString(),
          statusId: 'SCHEDULED',
          typeId: 'REGULAR'
        })
      })

      if (!res.ok) throw new Error('Failed to create appointment')
      
      const newAppointment = await res.json()
      setAppointments(prev => [...prev, newAppointment])
    } catch (error) {
      throw error // Let error boundary handle it
    }
  }

  const handleUpdateStatus = async (appointmentId: string, status: AppointmentStatusType) => {
    if (!practiceId) return

    try {
      const res = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          statusId: status,
          userId: user?.id
        })
      })

      if (!res.ok) throw new Error('Failed to update appointment status')
      
      const updatedAppointment = await res.json()
      setAppointments(prev => 
        prev.map(apt => 
          apt.id === appointmentId ? updatedAppointment : apt
        )
      )
    } catch (error) {
      throw error // Let error boundary handle it
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-[200px]" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-6">Appointments</h1>
      <Calendar
        userId={user?.id!}
        userRole={user?.role as 'SYSTEM_ADMIN' | 'PRACTICE_ADMIN' | 'PRACTITIONER' | 'PATIENT'}
        appointments={appointments}
        practiceId={practiceId!}
        onCreateAppointment={handleCreateAppointment}
        onUpdateStatus={handleUpdateStatus}
      />
    </div>
  )
}

export default function AppointmentsPage() {
  return (
    <ErrorBoundary
      fallback={
        <Alert variant="destructive">
          <AlertDescription>
            There was an error loading the appointments. Please try again later.
          </AlertDescription>
        </Alert>
      }
    >
      <AppointmentCalendarWithError />
    </ErrorBoundary>
  )
} 