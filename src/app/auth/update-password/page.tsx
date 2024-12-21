'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updatePassword, validatePassword } from '@/lib/auth/supabase'

export default function UpdatePassword() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)
    setValidationErrors([])

    // Check if passwords match
    if (password !== confirmPassword) {
      setMessage({
        type: 'error',
        text: 'Passwords do not match'
      })
      setLoading(false)
      return
    }

    // Validate password strength
    const { isValid, errors } = validatePassword(password)
    if (!isValid) {
      setValidationErrors(errors)
      setLoading(false)
      return
    }

    try {
      await updatePassword(password)
      setMessage({
        type: 'success',
        text: 'Password updated successfully! Redirecting to login...'
      })
      setTimeout(() => router.push('/auth/login'), 3000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to update password. Please try again.'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-sage dark:bg-dark-primary-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Update your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Please enter your new password
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div className="mb-4">
              <label htmlFor="password" className="sr-only">
                New Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-secondary-navy focus:outline-none focus:ring-primary-teal dark:focus:ring-dark-primary-teal focus:border-primary-teal dark:focus:border-dark-primary-teal focus:z-10 sm:text-sm"
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="sr-only">
                Confirm Password
              </label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-secondary-navy focus:outline-none focus:ring-primary-teal dark:focus:ring-dark-primary-teal focus:border-primary-teal dark:focus:border-dark-primary-teal focus:z-10 sm:text-sm"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          {validationErrors.length > 0 && (
            <div className="rounded-md bg-yellow-50 dark:bg-yellow-900 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  {/* Warning icon */}
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-100">
                    Password requirements:
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-200">
                    <ul className="list-disc pl-5 space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {message && (
            <div className={`rounded-md p-4 ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-100' 
                : 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-100'
            }`}>
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-teal dark:bg-dark-primary-teal hover:bg-primary-blue dark:hover:bg-dark-primary-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-teal dark:focus:ring-dark-primary-teal disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 