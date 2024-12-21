'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'
import { Practice, getUserPractices } from '@/lib/practice'
import { useTheme } from '@/lib/theme/ThemeContext'
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline'
import {
  HomeIcon,
  CalendarIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChatBubbleLeftIcon,
  UserCircleIcon,
  ClockIcon,
  ClipboardDocumentIcon,
  BuildingOfficeIcon,
  UsersIcon,
  BanknotesIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  DocumentMagnifyingGlassIcon,
  CalendarDaysIcon,
} from '@heroicons/react/24/outline'

// Base navigation items available to all authenticated users
const baseNavigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, roles: ['USER', 'DOCTOR', 'ADMIN', 'SUPERADMIN'] },
]

// Role-specific navigation items
const roleNavigation = {
  USER: [
    { name: 'Book Appointment', href: '/dashboard/appointments/book', icon: CalendarDaysIcon },
    { name: 'My Appointments', href: '/dashboard/appointments', icon: CalendarIcon },
    { name: 'My Records', href: '/dashboard/records', icon: DocumentTextIcon },
    { name: 'My Prescriptions', href: '/dashboard/prescriptions', icon: ClipboardDocumentIcon },
    { name: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftIcon },
    { name: 'Profile', href: '/dashboard/profile', icon: UserCircleIcon },
  ],
  DOCTOR: [
    { name: 'My Schedule', href: '/dashboard/schedule', icon: ClockIcon },
    { name: 'Appointments', href: '/dashboard/appointments', icon: CalendarIcon },
    { name: 'Patients', href: '/dashboard/patients', icon: UserGroupIcon },
    { name: 'Consultations', href: '/dashboard/consultations', icon: ClipboardDocumentIcon },
    { name: 'Prescriptions', href: '/dashboard/prescriptions', icon: DocumentTextIcon },
    { name: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftIcon },
    { name: 'My Profile', href: '/dashboard/profile', icon: UserCircleIcon },
  ],
  ADMIN: [
    { name: 'Appointments', href: '/dashboard/appointments', icon: CalendarIcon },
    { name: 'Patients', href: '/dashboard/patients', icon: UserGroupIcon },
    { name: 'Practice', href: '/dashboard/practice', icon: BuildingOfficeIcon },
    { name: 'Staff', href: '/dashboard/staff', icon: UsersIcon },
    { name: 'Billing', href: '/dashboard/billing', icon: BanknotesIcon },
    { name: 'Reports', href: '/dashboard/reports', icon: ChartBarIcon },
    { name: 'Messages', href: '/dashboard/messages', icon: ChatBubbleLeftIcon },
    { name: 'Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
  ],
  SUPERADMIN: [
    { name: 'Practices', href: '/dashboard/practices', icon: BuildingOfficeIcon },
    { name: 'Users', href: '/dashboard/users', icon: UsersIcon },
    { name: 'Billing', href: '/dashboard/billing', icon: BanknotesIcon },
    { name: 'Analytics', href: '/dashboard/analytics', icon: ChartBarIcon },
    { name: 'System Logs', href: '/dashboard/logs', icon: DocumentMagnifyingGlassIcon },
    { name: 'System Settings', href: '/dashboard/settings', icon: Cog6ToothIcon },
  ]
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [currentPractice, setCurrentPractice] = useState<string | null>(null)
  const [practices, setPractices] = useState<Practice[]>([])
  const [loading, setLoading] = useState(true)
  const { theme, toggleTheme } = useTheme()

  const userRole = user?.user_metadata?.role || 'USER'

  // Combine navigation items based on user role
  const navigation = [
    ...baseNavigation.filter(item => item.roles.includes(userRole)),
    ...(roleNavigation[userRole as keyof typeof roleNavigation] || [])
  ]

  useEffect(() => {
    const loadPractices = async () => {
      if (user?.id) {
        try {
          const userPractices = await getUserPractices(user.id)
          setPractices(userPractices)
          
          // Set first practice as current if none selected
          if (userPractices.length > 0 && !currentPractice) {
            setCurrentPractice(userPractices[0].id)
          }
        } catch (error) {
          console.error('Failed to load practices:', error)
        } finally {
          setLoading(false)
        }
      }
    }

    loadPractices()
  }, [user?.id, currentPractice])

  // Mobile menu toggle
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  const handlePracticeChange = (practiceId: string) => {
    setCurrentPractice(practiceId)
    // You might want to store this in localStorage or sync with a global state
  }

  return (
    <div className="min-h-screen bg-secondary-sage dark:bg-dark-primary-background">
      {/* Mobile menu button */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-16 items-center bg-primary-teal px-4 sm:px-6 md:hidden">
        <button
          type="button"
          className="text-white hover:text-secondary-coral focus:outline-none"
          onClick={toggleSidebar}
        >
          <span className="sr-only">Open sidebar</span>
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
        <div className="ml-4 flex items-center">
          <h1 className="text-lg font-bold text-white dark:text-dark-text-primary">SalusFlow</h1>
          <button
            onClick={toggleTheme}
            className="ml-4 p-2 text-white hover:text-secondary-coral focus:outline-none"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Sidebar for desktop */}
      <div className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex min-h-0 flex-1 flex-col bg-secondary-navy dark:bg-dark-secondary-navy">
          <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center px-4">
              <h1 className="text-xl font-bold text-white dark:text-dark-text-primary">SalusFlow</h1>
            </div>

            {/* Practice Switcher - Only show for appropriate roles */}
            {(['DOCTOR', 'ADMIN', 'SUPERADMIN'].includes(userRole)) && (
              <div className="mt-5 px-4">
                <label htmlFor="practice" className="block text-sm font-medium text-primary-blue">
                  Current Practice
                </label>
                <select
                  id="practice"
                  name="practice"
                  className="mt-1 block w-full rounded-md border-primary-teal bg-white text-secondary-navy shadow-sm focus:border-primary-blue focus:ring-primary-blue sm:text-sm"
                  value={currentPractice || ''}
                  onChange={(e) => handlePracticeChange(e.target.value)}
                  disabled={loading}
                >
                  <option value="">Select Practice</option>
                  {practices.map((practice) => (
                    <option key={practice.id} value={practice.id}>
                      {practice.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <nav className="mt-5 flex-1 space-y-1 px-2">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href)
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                      isActive
                        ? 'bg-primary-teal dark:bg-dark-primary-teal text-white dark:text-dark-text-primary'
                        : 'text-primary-blue dark:text-dark-text-secondary hover:bg-primary-blue dark:hover:bg-dark-primary-blue hover:text-white dark:hover:text-dark-text-primary'
                    }`}
                  >
                    <Icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
          </div>
          <div className="flex flex-shrink-0 bg-primary-teal p-4">
            <div className="group block w-full flex-shrink-0">
              <div className="flex items-center">
                <div>
                  <p className="text-sm font-medium text-white">{user?.user_metadata?.name}</p>
                  <p className="text-xs text-primary-blue">{userRole}</p>
                  <button
                    onClick={() => signOut()}
                    className="mt-1 text-xs font-medium text-primary-blue hover:text-secondary-coral"
                  >
                    Sign out
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          {/* Background overlay */}
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-75"
            onClick={toggleSidebar}
          />

          {/* Sidebar */}
          <div className="fixed inset-y-0 left-0 flex w-full max-w-xs flex-col bg-secondary-navy dark:bg-dark-secondary-navy">
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto pt-5 pb-4">
              <div className="flex items-center justify-between px-4">
                <h1 className="text-lg font-bold text-white dark:text-dark-text-primary">SalusFlow</h1>
                <button
                  type="button"
                  className="text-primary-blue dark:text-dark-text-secondary hover:text-white dark:hover:text-dark-text-primary"
                  onClick={toggleSidebar}
                >
                  <span className="sr-only">Close sidebar</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth="1.5"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Practice Switcher for mobile - Only show for appropriate roles */}
              {(['DOCTOR', 'ADMIN', 'SUPERADMIN'].includes(userRole)) && (
                <div className="mt-5 px-4">
                  <label htmlFor="practice-mobile" className="block text-sm font-medium text-primary-blue dark:text-dark-text-secondary">
                    Current Practice
                  </label>
                  <select
                    id="practice-mobile"
                    name="practice"
                    className="mt-1 block w-full rounded-md border-primary-teal dark:border-dark-primary-teal bg-white dark:bg-dark-primary-background text-secondary-navy dark:text-dark-text-primary shadow-sm focus:border-primary-blue dark:focus:border-dark-primary-blue focus:ring-primary-blue dark:focus:ring-dark-primary-blue sm:text-sm"
                    value={currentPractice || ''}
                    onChange={(e) => handlePracticeChange(e.target.value)}
                    disabled={loading}
                  >
                    <option value="">Select Practice</option>
                    {practices.map((practice) => (
                      <option key={practice.id} value={practice.id}>
                        {practice.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <nav className="mt-5 flex-1 space-y-1 px-2">
                {navigation.map((item) => {
                  const isActive = pathname.startsWith(item.href)
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={toggleSidebar}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        isActive
                          ? 'bg-primary-teal dark:bg-dark-primary-teal text-white dark:text-dark-text-primary'
                          : 'text-primary-blue dark:text-dark-text-secondary hover:bg-primary-blue dark:hover:bg-dark-primary-blue hover:text-white dark:hover:text-dark-text-primary'
                      }`}
                    >
                      <Icon className="mr-3 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                      {item.name}
                    </Link>
                  )
                })}
              </nav>
            </div>
            <div className="flex flex-shrink-0 bg-primary-teal dark:bg-dark-primary-teal p-4">
              <div className="group block w-full flex-shrink-0">
                <div className="flex items-center">
                  <div>
                    <p className="text-sm font-medium text-white dark:text-dark-text-primary">
                      {user?.user_metadata?.name}
                    </p>
                    <p className="text-xs text-primary-blue dark:text-dark-text-secondary">
                      {userRole}
                    </p>
                    <button
                      onClick={() => signOut()}
                      className="mt-1 text-xs font-medium text-primary-blue dark:text-dark-text-secondary hover:text-secondary-coral dark:hover:text-dark-secondary-coral"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col md:pl-64">
        <main className="flex-1">
          <div className="py-6">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
} 