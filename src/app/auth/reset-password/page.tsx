'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { resetPassword, validatePassword } from '@/lib/auth/supabase'

export default function ResetPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      await resetPassword(email)
      setMessage({
        type: 'success',
        text: 'Check your email for the password reset link'
      })
      // Optionally redirect after a delay
      setTimeout(() => router.push('/auth/login'), 3000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to send reset password email. Please try again.'
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
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white bg-white dark:bg-dark-secondary-navy focus:outline-none focus:ring-primary-teal dark:focus:ring-dark-primary-teal focus:border-primary-teal dark:focus:border-dark-primary-teal focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

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
              {loading ? 'Sending...' : 'Send reset link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 