'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { verifyEmail, resendVerificationEmail } from '@/lib/auth/supabase'

export default function VerifyEmail() {
  const [verifying, setVerifying] = useState(true)
  const [resending, setResending] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')
    const email = searchParams.get('email')

    if (token && email) {
      handleVerification(token, email)
    } else {
      setVerifying(false)
      setMessage({
        type: 'error',
        text: 'Invalid verification link. Please request a new one.'
      })
    }
  }, [searchParams])

  const handleVerification = async (token: string, email: string) => {
    try {
      await verifyEmail(token, email)
      setMessage({
        type: 'success',
        text: 'Email verified successfully! Redirecting to login...'
      })
      setTimeout(() => router.push('/auth/login'), 3000)
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to verify email. The link may have expired.'
      })
    } finally {
      setVerifying(false)
    }
  }

  const handleResend = async () => {
    const email = searchParams.get('email')
    if (!email) {
      setMessage({
        type: 'error',
        text: 'No email address found. Please try signing up again.'
      })
      return
    }

    setResending(true)
    try {
      await resendVerificationEmail(email)
      setMessage({
        type: 'success',
        text: 'Verification email sent! Please check your inbox.'
      })
    } catch (error) {
      setMessage({
        type: 'error',
        text: 'Failed to resend verification email. Please try again.'
      })
    } finally {
      setResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-sage dark:bg-dark-primary-background py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Email Verification
          </h2>
          {verifying ? (
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              Verifying your email address...
            </p>
          ) : (
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
              {message?.type === 'error' ? 'Verification failed' : 'Almost there!'}
            </p>
          )}
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

        {message?.type === 'error' && (
          <div className="mt-4">
            <button
              onClick={handleResend}
              disabled={resending}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-teal dark:bg-dark-primary-teal hover:bg-primary-blue dark:hover:bg-dark-primary-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-teal dark:focus:ring-dark-primary-teal disabled:opacity-50"
            >
              {resending ? 'Sending...' : 'Resend verification email'}
            </button>
          </div>
        )}
      </div>
    </div>
  )
} 