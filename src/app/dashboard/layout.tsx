'use client'

import { PracticeSwitcher } from '@/components/dashboard/practice-switcher'
import { UserNav } from '@/components/dashboard/user-nav'
import { AuthProvider } from '@/lib/auth/context'
import { PracticeProvider } from '@/lib/practice/context'
import { Toaster } from '@/components/ui/toaster'
import { ErrorBoundary } from '@/components/error-boundary'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <AuthProvider>
      <PracticeProvider>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
              <ErrorBoundary>
                <PracticeSwitcher />
              </ErrorBoundary>
              <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
                <ErrorBoundary>
                  <UserNav />
                </ErrorBoundary>
              </div>
            </div>
          </header>
          <main className="flex-1">
            <ErrorBoundary>{children}</ErrorBoundary>
          </main>
          <Toaster />
        </div>
      </PracticeProvider>
    </AuthProvider>
  )
} 