import { type VariantProps } from 'class-variance-authority'
import { buttonVariants } from './button'

export type ButtonVariants = VariantProps<typeof buttonVariants>

export interface ToastActionElement {
  altText: string
  onClick: () => void
  children: React.ReactNode
}

export interface ToastProps {
  variant?: 'default' | 'destructive'
  title?: string
  description?: string
  action?: ToastActionElement
  duration?: number
  className?: string
  onOpenChange?: (open: boolean) => void
}

export interface CommandProps {
  value?: string
  onValueChange?: (value: string) => void
  filter?: (value: string, search: string) => boolean
  loop?: boolean
  children?: React.ReactNode
}

export interface PopoverProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
  children?: React.ReactNode
}

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string
}

export interface AvatarProps {
  src?: string
  alt?: string
  fallback?: string
  className?: string
}

export interface DropdownMenuProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  modal?: boolean
  children?: React.ReactNode
} 