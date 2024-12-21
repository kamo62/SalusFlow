'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/auth/supabase'
import { supabaseAdmin } from '@/lib/auth/supabase-admin'
import type { User } from '@supabase/auth-helpers-nextjs'

interface ExtendedUser extends User {
  user_metadata: {
    name: string
    role: string
  }
}

export default function UsersPage() {
  const [users, setUsers] = useState<ExtendedUser[]>([])
  const [currentUser, setCurrentUser] = useState<ExtendedUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [inviteData, setInviteData] = useState({
    email: '',
    name: '',
    role: 'USER'
  })

  useEffect(() => {
    async function loadUsers() {
      try {
        // Get current user
        const { data: { session } } = await supabase.auth.getSession()
        setCurrentUser(session?.user as ExtendedUser)

        // Only SuperAdmin and Admin can list users
        if (session?.user?.user_metadata?.role === 'SUPERADMIN' || 
            session?.user?.user_metadata?.role === 'ADMIN') {
          const { data: users, error } = await supabaseAdmin.auth.admin.listUsers()
          if (error) throw error
          setUsers(users.users as ExtendedUser[])
        } else {
          setError('Unauthorized: Only SuperAdmin and Admin can view users')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load users')
      } finally {
        setLoading(false)
      }
    }

    loadUsers()
  }, [])

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      // Generate a temporary password
      const tempPassword = Math.random().toString(36).slice(-8) + 'Aa1!'
      
      await supabaseAdmin.auth.admin.createUser({
        email: inviteData.email,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
          name: inviteData.name,
          role: inviteData.role
        }
      })

      // Send password reset email to let user set their own password
      await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email: inviteData.email
      })

      // Refresh user list
      const { data: users } = await supabaseAdmin.auth.admin.listUsers()
      setUsers(users.users as ExtendedUser[])
      
      setShowInviteModal(false)
      setInviteData({ email: '', name: '', role: 'USER' })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite user')
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return
    
    try {
      await supabaseAdmin.auth.admin.deleteUser(userId)
      setUsers(users.filter(user => user.id !== userId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user')
    }
  }

  const handleResetPassword = async (email: string) => {
    try {
      await supabaseAdmin.auth.admin.generateLink({
        type: 'recovery',
        email
      })
      alert('Password reset email sent')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send reset email')
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Loading users...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        {(currentUser?.user_metadata?.role === 'SUPERADMIN' || 
          currentUser?.user_metadata?.role === 'ADMIN') && (
          <button
            className="bg-primary text-white px-4 py-2 rounded hover:bg-primary/90"
            onClick={() => setShowInviteModal(true)}
          >
            Invite User
          </button>
        )}
      </div>

      {/* Invite User Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Invite User</h2>
            <form onSubmit={handleInviteUser}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Email</label>
                  <input
                    type="email"
                    value={inviteData.email}
                    onChange={(e) => setInviteData({ ...inviteData, email: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Name</label>
                  <input
                    type="text"
                    value={inviteData.name}
                    onChange={(e) => setInviteData({ ...inviteData, name: e.target.value })}
                    className="w-full p-2 border rounded"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Role</label>
                  <select
                    value={inviteData.role}
                    onChange={(e) => setInviteData({ ...inviteData, role: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="USER">User</option>
                    <option value="DOCTOR">Doctor</option>
                    <option value="ADMIN">Admin</option>
                    {currentUser?.user_metadata?.role === 'SUPERADMIN' && (
                      <option value="SUPERADMIN">Super Admin</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="flex justify-end space-x-2 mt-6">
                <button
                  type="button"
                  onClick={() => setShowInviteModal(false)}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded"
                >
                  Invite
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Created At
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {user.user_metadata.name}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-gray-300">
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {user.user_metadata.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    className="text-primary hover:text-primary/90 mr-4"
                    onClick={() => handleResetPassword(user.email!)}
                  >
                    Reset Password
                  </button>
                  <button
                    className="text-red-600 hover:text-red-900"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
} 