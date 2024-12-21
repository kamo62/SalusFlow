'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/auth/supabase'
import type { User as SupabaseUser } from '@supabase/auth-helpers-nextjs'

interface ExtendedUser extends Omit<SupabaseUser, 'user_metadata'> {
  user_metadata: {
    name: string
    role: string
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<ExtendedUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user?.user_metadata?.name && session?.user?.user_metadata?.role) {
        setUser(session.user as ExtendedUser)
      }
      setLoading(false)
    }

    loadUser()
  }, [])

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="p-8">
        <div className="text-red-500">Error: User data not available</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Welcome, {user.user_metadata.name}!</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-4">
            {user.user_metadata.role === 'DOCTOR' && (
              <>
                <button className="w-full text-left px-4 py-2 bg-primary/10 text-primary rounded hover:bg-primary/20">
                  View Today's Appointments
                </button>
                <button className="w-full text-left px-4 py-2 bg-primary/10 text-primary rounded hover:bg-primary/20">
                  Start New Consultation
                </button>
              </>
            )}
            {(user.user_metadata.role === 'ADMIN' || user.user_metadata.role === 'SUPERADMIN') && (
              <>
                <button className="w-full text-left px-4 py-2 bg-primary/10 text-primary rounded hover:bg-primary/20">
                  Manage Users
                </button>
                <button className="w-full text-left px-4 py-2 bg-primary/10 text-primary rounded hover:bg-primary/20">
                  Practice Settings
                </button>
              </>
            )}
            <button className="w-full text-left px-4 py-2 bg-primary/10 text-primary rounded hover:bg-primary/20">
              View Schedule
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="text-sm text-gray-600 dark:text-gray-300">
              No recent activity to display.
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Statistics</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Appointments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Patients</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Consultations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">Documents</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 