'use client'

import * as React from 'react'
import { Calendar as CalendarIcon } from 'lucide-react'
import { DayPicker } from 'react-day-picker'
import { format } from 'date-fns'
import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/lib/database.types'
import { AppointmentStatusType, Appointment } from '@/lib/appointment/types'
import { usePractice } from '@/lib/practice/context'
import { PracticeSelector } from '@/components/practices/practice-selector'
import { ErrorBoundary } from '@/components/error-boundary'
import { Alert, AlertDescription } from '../ui/alert'

import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import { Calendar as UICalendar } from '../ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover'
import { Card } from '../ui/card'
import { Skeleton } from '../ui/skeleton'

interface AppointmentCalendarProps {
  userId: string
  userRole: 'SYSTEM_ADMIN' | 'PRACTICE_ADMIN' | 'PRACTITIONER' | 'PATIENT'
  className?: string
  appointments: Appointment[]
  practiceId: string
  onCreateAppointment: (date: string, patientId: string) => Promise<void>
  onUpdateStatus: (appointmentId: string, status: AppointmentStatusType) => Promise<void>
}

function AppointmentCalendarContent({
  userId,
  userRole,
  className,
}: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(new Date())
  const [selectedPractice, setSelectedPractice] = React.useState<string | undefined>()
  const [appointments, setAppointments] = React.useState<Appointment[]>([])
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)
  const { practices } = usePractice()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchAppointments = React.useCallback(async (date: Date, practiceId?: string) => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('appointments')
        .select('*')
        .gte('start_time', date.toISOString().split('T')[0])
        .lt(
          'start_time',
          new Date(date.getTime() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split('T')[0]
        )

      if (userRole === 'PRACTITIONER') {
        query = query.eq('practitioner_id', userId)
      } else if (userRole === 'PATIENT') {
        query = query.eq('patient_id', userId)
      } else if (practiceId) {
        query = query.eq('practice_id', practiceId)
      }

      const { data, error: fetchError } = await query

      if (fetchError) {
        throw fetchError
      }

      setAppointments(data || [])
    } catch (err) {
      throw err // Let error boundary handle it
    } finally {
      setLoading(false)
    }
  }, [supabase, userId, userRole])

  React.useEffect(() => {
    if (selectedDate) {
      fetchAppointments(selectedDate, selectedPractice)
    }
  }, [selectedDate, selectedPractice, fetchAppointments])

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
  }

  const handlePracticeChange = (practiceId: string) => {
    setSelectedPractice(practiceId)
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
    <div className={cn("space-y-4", className)}>
      {(userRole === 'SYSTEM_ADMIN' || userRole === 'PRACTICE_ADMIN') && (
        <PracticeSelector
          practices={practices}
          selectedPracticeId={selectedPractice}
          onPracticeChange={handlePracticeChange}
        />
      )}

      <div className="flex space-x-4">
        <div>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={'outline'}
                className={cn(
                  'w-[280px] justify-start text-left font-normal',
                  !selectedDate && 'text-muted-foreground'
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? format(selectedDate, 'PPP') : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <UICalendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex-1">
          {error && (
            <Card className="p-4 border-destructive">
              <p className="text-destructive">{error}</p>
            </Card>
          )}
          {!loading && !error && (
            <div className="space-y-2">
              {appointments.length === 0 ? (
                <Card className="p-4">
                  <p className="text-muted-foreground">No appointments for this date</p>
                </Card>
              ) : (
                appointments.map((appointment) => (
                  <Card key={appointment.id} className="p-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">
                            {format(new Date(appointment.startTime), 'h:mm a')} - {format(new Date(appointment.endTime), 'h:mm a')}
                          </p>
                          <p className="text-sm text-muted-foreground">Status: {appointment.statusId}</p>
                        </div>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-muted-foreground">{appointment.notes}</p>
                      )}
                    </div>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export function Calendar(props: AppointmentCalendarProps) {
  return (
    <ErrorBoundary
      fallback={
        <Alert variant="destructive">
          <AlertDescription>
            There was an error loading the calendar. Please try again later.
          </AlertDescription>
        </Alert>
      }
    >
      <AppointmentCalendarContent {...props} />
    </ErrorBoundary>
  )
} 