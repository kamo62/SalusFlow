'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '../ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Practice } from '@/lib/practice/types'

interface PracticeSelectorProps {
  selectedPracticeId?: string
  onPracticeChange: (practiceId: string) => void
  className?: string
  practices: Practice[]
}

export function PracticeSelector({
  selectedPracticeId,
  onPracticeChange,
  className,
  practices
}: PracticeSelectorProps) {
  const [open, setOpen] = useState(false)
  const selectedPractice = practices.find(p => p.id === selectedPracticeId)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn('w-[250px] justify-between', className)}
        >
          {selectedPractice ? selectedPractice.name : 'Select practice...'}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search practices..." />
          <CommandEmpty>No practice found.</CommandEmpty>
          <CommandGroup>
            {practices.map((practice) => (
              <CommandItem
                key={practice.id}
                value={practice.id}
                onSelect={() => {
                  onPracticeChange(practice.id)
                  setOpen(false)
                }}
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    selectedPracticeId === practice.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {practice.name}
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
} 