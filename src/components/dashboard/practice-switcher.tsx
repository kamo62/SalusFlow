'use client'

import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'
import { usePractice } from '@/lib/practice/context'
import { useAuth } from '@/lib/auth/context'
import { PracticeSelector } from '../practices/practice-selector'
import { Button } from '../ui/button'
import { Skeleton } from '../ui/skeleton'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu'
import { Settings, UserPlus, Calendar, Building } from 'lucide-react'

export function PracticeSwitcher() {
  const { practices, selectedPractice, selectPractice } = usePractice()
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(true)

  const canManagePractice = user?.role === 'PRACTICE_ADMIN' || user?.role === 'SYSTEM_ADMIN'

  useEffect(() => {
    // Simulate loading check
    const timer = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <Skeleton className="h-10 w-[250px]" />
  }

  return (
    <div className="flex items-center gap-4">
      <PracticeSelector
        practices={practices}
        selectedPracticeId={selectedPractice?.id}
        onPracticeChange={selectPractice}
      />
      
      {canManagePractice && selectedPractice && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Practice settings</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <a href={`/practices/${selectedPractice.id}/doctors`} className="flex items-center">
                <UserPlus className="mr-2 h-4 w-4" />
                Manage Doctors
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href={`/practices/${selectedPractice.id}/appointments`} className="flex items-center">
                <Calendar className="mr-2 h-4 w-4" />
                Manage Appointments
              </a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href={`/practices/${selectedPractice.id}/settings`} className="flex items-center">
                <Building className="mr-2 h-4 w-4" />
                Practice Settings
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}

      {selectedPractice && (
        <div className="text-sm text-muted-foreground hidden md:block">
          {practices.length} {practices.length === 1 ? 'practice' : 'practices'} available
        </div>
      )}
    </div>
  )
} 