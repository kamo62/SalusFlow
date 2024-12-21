'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { signUp, validatePassword } from '@/lib/auth/supabase'
import {
  Button,
  Input,
  Label,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Alert,
  AlertDescription,
  Icons,
  ThemeToggle,
} from '@/components/ui'

export default function RegisterPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    // Validate password
    const { isValid, errors } = validatePassword(password)
    if (!isValid) {
      setError(errors.join('\n'))
      return
    }

    setLoading(true)

    try {
      await signUp(email, password, {
        name: email.split('@')[0], // Temporary name from email
        role: 'USER'
      })
      router.push('/auth/verify-email')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background-secondary dark:bg-background-dark py-section px-4 sm:px-6 lg:px-8">
      <ThemeToggle />
      
      {/* Logo */}
      <div className="mb-8">
        <h1 className="text-logo font-bold text-primary dark:text-secondary">
          SalusFlow
        </h1>
      </div>

      <Card className="w-full max-w-[480px] shadow-sm">
        <CardHeader className="space-y-1 p-6 pb-4">
          <CardTitle className="text-h2 font-bold tracking-tight text-center text-foreground dark:text-foreground-dark-primary">
            Create your account
          </CardTitle>
          <CardDescription className="text-center text-base text-foreground-muted dark:text-foreground-dark-secondary">
            Enter your details to start your free trial
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6 pt-2">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-foreground dark:text-foreground-dark-primary">
                  Email address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="mt-1.5"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="password" className="text-sm font-medium text-foreground dark:text-foreground-dark-primary">
                  Password
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Create a password"
                  className="mt-1.5"
                  disabled={loading}
                />
              </div>

              <div>
                <Label htmlFor="confirm-password" className="text-sm font-medium text-foreground dark:text-foreground-dark-primary">
                  Confirm Password
                </Label>
                <Input
                  id="confirm-password"
                  name="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your password"
                  className="mt-1.5"
                  disabled={loading}
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription className="whitespace-pre-line text-sm">
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full bg-primary text-white hover:bg-primary/90 dark:bg-primary-dark dark:hover:bg-primary-dark/90"
              disabled={loading}
            >
              {loading && (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              )}
              {loading ? 'Creating account...' : 'Create account'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-foreground-muted dark:text-foreground-dark-secondary">
                Already have an account?{' '}
              </span>
              <Link
                href="/auth/login"
                className="font-medium text-primary hover:text-primary/90 dark:text-secondary dark:hover:text-secondary/90"
              >
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 