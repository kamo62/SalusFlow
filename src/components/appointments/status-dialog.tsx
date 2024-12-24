import { useState } from 'react'
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  Button
} from '@/components/ui'
import { AppointmentStatusType } from '@/lib/appointment/types'
import { StatusBadge } from './status-badge'

interface StatusDialogProps {
  isOpen: boolean
  onClose: () => void
  currentStatus: AppointmentStatusType
  onUpdateStatus: (status: AppointmentStatusType) => Promise<void>
}

const AVAILABLE_TRANSITIONS: Record<AppointmentStatusType, AppointmentStatusType[]> = {
  SCHEDULED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['IN_PROGRESS', 'CANCELLED', 'NO_SHOW'],
  IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: []
}

export function StatusDialog({ 
  isOpen, 
  onClose, 
  currentStatus, 
  onUpdateStatus 
}: StatusDialogProps) {
  const [loading, setLoading] = useState(false)
  const availableStatuses = AVAILABLE_TRANSITIONS[currentStatus]

  const handleStatusUpdate = async (newStatus: AppointmentStatusType) => {
    try {
      setLoading(true)
      await onUpdateStatus(newStatus)
      onClose()
    } catch (error) {
      console.error('Failed to update status:', error)
      // TODO: Show error toast
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Appointment Status</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <div className="mb-4">
            <p className="text-sm text-gray-500 mb-2">Current Status:</p>
            <StatusBadge status={currentStatus} />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-500 mb-2">Change status to:</p>
            {availableStatuses.map(status => (
              <Button
                key={status}
                variant="outline"
                className="w-full justify-start"
                disabled={loading}
                onClick={() => handleStatusUpdate(status)}
              >
                <StatusBadge status={status} className="mr-2" />
              </Button>
            ))}
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
} 