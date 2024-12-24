'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/context'
import { usePractice } from '@/lib/practice/context'
import { cn } from '@/lib/utils'
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
  Label,
  Alert,
  AlertDescription,
  Icons,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui'

export default function PracticesPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { practices, createPractice, selectedPractice, selectPractice } = usePractice()
  const [newPracticeName, setNewPracticeName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleCreatePractice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      await createPractice({
        name: newPracticeName,
        ownerId: user?.id!,
      })
      setNewPracticeName('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create practice')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Practices</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Icons.add className="mr-2 h-4 w-4" />
              New Practice
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Practice</DialogTitle>
              <DialogDescription>
                Add a new practice to your account
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreatePractice} className="space-y-4">
              <div>
                <Label htmlFor="name">Practice Name</Label>
                <Input
                  id="name"
                  value={newPracticeName}
                  onChange={(e) => setNewPracticeName(e.target.value)}
                  placeholder="Enter practice name"
                  required
                />
              </div>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" disabled={loading}>
                {loading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                {loading ? 'Creating...' : 'Create Practice'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {practices.map((practice) => (
          <Card
            key={practice.id}
            className={cn(
              'hover:shadow-lg transition-shadow cursor-pointer',
              selectedPractice?.id === practice.id && 'border-primary'
            )}
            onClick={() => selectPractice(practice.id)}
          >
            <CardHeader>
              <CardTitle>{practice.name}</CardTitle>
              <CardDescription>
                {practice.id === selectedPractice?.id ? 'Current Practice' : 'Click to select'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/practices/${practice.id}/settings`)
                  }}
                >
                  <Icons.settings className="mr-2 h-4 w-4" />
                  Settings
                </Button>
                <Button
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    router.push(`/practices/${practice.id}/doctors`)
                  }}
                >
                  <Icons.user className="mr-2 h-4 w-4" />
                  Doctors
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 