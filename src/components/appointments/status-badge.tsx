import { Badge } from '@/components/ui'
import { AppointmentStatusType } from '@/lib/appointment/types'

const STATUS_COLORS = {
  SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
  CONFIRMED: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  COMPLETED: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300',
  CANCELLED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300',
  NO_SHOW: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
}

const STATUS_LABELS = {
  SCHEDULED: 'Scheduled',
  CONFIRMED: 'Confirmed',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No Show'
}

interface StatusBadgeProps {
  status: AppointmentStatusType
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <Badge className={`${STATUS_COLORS[status]} ${className || ''}`}>
      {STATUS_LABELS[status]}
    </Badge>
  )
} 