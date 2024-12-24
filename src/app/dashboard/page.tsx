'use client'

import { useAuth } from '@/lib/auth/context'
import { usePractice } from '@/lib/practice/context'
import { useRouter } from 'next/navigation'
import { 
  Card, 
  CardHeader, 
  CardTitle, 
  CardDescription, 
  CardContent,
  Button,
  Icons,
  ThemeToggle
} from '@/components/ui'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const { selectedPractice } = usePractice()
  const router = useRouter()

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push('/login')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const menuItems = [
    {
      title: 'Appointments',
      description: 'Manage patient appointments',
      icon: Icons.calendar,
      href: '/appointments',
    },
    {
      title: 'Patients',
      description: 'View and manage patients',
      icon: Icons.user,
      href: '/patients',
    },
    {
      title: 'Settings',
      description: 'Configure practice settings',
      icon: Icons.settings,
      href: '/settings',
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <span className="text-foreground">{user?.email}</span>
              <Button
                variant="destructive"
                onClick={handleSignOut}
                className="flex items-center"
              >
                <Icons.close className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {selectedPractice ? (
          <>
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Welcome to {selectedPractice.name}
              </h2>
              <p className="text-muted-foreground">
                Select a menu item below to get started
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {menuItems.map((item) => (
                <Card 
                  key={item.title}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => router.push(item.href)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <item.icon className="mr-2 h-5 w-5" />
                      {item.title}
                    </CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Practice Selected</CardTitle>
              <CardDescription>
                Please select a practice to view the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/practices')}>
                Select Practice
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
} 