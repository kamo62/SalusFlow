'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
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

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

type Doctor = {
  id: string
  user_id: string
  practice_id: string
  specialization: string
  consultation_fee: number
  user: {
    email: string
    full_name: string
  }
}

export default function DoctorsPage() {
  const { practiceId } = useParams()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newDoctor, setNewDoctor] = useState({
    email: '',
    fullName: '',
    specialization: '',
    consultationFee: '',
  })

  useEffect(() => {
    fetchDoctors()
  }, [practiceId])

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select(`
          id,
          user_id,
          practice_id,
          specialization,
          consultation_fee,
          user:users (
            email,
            full_name
          )
        `)
        .eq('practice_id', practiceId)
        .returns<Doctor[]>()

      if (error) throw error

      setDoctors(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch doctors')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateDoctor = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      // First create the user
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: newDoctor.email,
        password: Math.random().toString(36).slice(-8), // Generate random password
      })

      if (userError) throw userError

      if (!userData.user) throw new Error('No user returned from creation')

      // Update user profile
      const { error: profileError } = await supabase
        .from('users')
        .update({ full_name: newDoctor.fullName })
        .eq('id', userData.user.id)

      if (profileError) throw profileError

      // Create doctor record
      const { error: doctorError } = await supabase
        .from('doctors')
        .insert([{
          user_id: userData.user.id,
          practice_id: practiceId,
          specialization: newDoctor.specialization,
          consultation_fee: parseFloat(newDoctor.consultationFee),
        }])

      if (doctorError) throw doctorError

      // Create practice_user record
      const { error: practiceUserError } = await supabase
        .from('practice_users')
        .insert([{
          user_id: userData.user.id,
          practice_id: practiceId,
          role: 'DOCTOR',
        }])

      if (practiceUserError) throw practiceUserError

      // Reset form and refresh doctors list
      setNewDoctor({
        email: '',
        fullName: '',
        specialization: '',
        consultationFee: '',
      })
      fetchDoctors()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create doctor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Doctors</h1>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Icons.add className="mr-2 h-4 w-4" />
              Add Doctor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Doctor</DialogTitle>
              <DialogDescription>
                Add a new doctor to your practice
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateDoctor} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newDoctor.email}
                  onChange={(e) => setNewDoctor({ ...newDoctor, email: e.target.value })}
                  placeholder="doctor@example.com"
                  required
                />
              </div>
              <div>
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  value={newDoctor.fullName}
                  onChange={(e) => setNewDoctor({ ...newDoctor, fullName: e.target.value })}
                  placeholder="Dr. John Doe"
                  required
                />
              </div>
              <div>
                <Label htmlFor="specialization">Specialization</Label>
                <Input
                  id="specialization"
                  value={newDoctor.specialization}
                  onChange={(e) => setNewDoctor({ ...newDoctor, specialization: e.target.value })}
                  placeholder="General Practitioner"
                  required
                />
              </div>
              <div>
                <Label htmlFor="consultationFee">Consultation Fee</Label>
                <Input
                  id="consultationFee"
                  type="number"
                  value={newDoctor.consultationFee}
                  onChange={(e) => setNewDoctor({ ...newDoctor, consultationFee: e.target.value })}
                  placeholder="0.00"
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
                {loading ? 'Adding...' : 'Add Doctor'}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {doctors.map((doctor) => (
          <Card key={doctor.id}>
            <CardHeader>
              <CardTitle>{doctor.user.full_name}</CardTitle>
              <CardDescription>{doctor.user.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <span className="font-medium">Specialization:</span>{' '}
                  {doctor.specialization}
                </div>
                <div>
                  <span className="font-medium">Consultation Fee:</span>{' '}
                  ${doctor.consultation_fee.toFixed(2)}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
} 