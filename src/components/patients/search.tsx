'use client'

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui'
import { Patient } from '@/lib/patient/types'
import { useDebounce } from '@/lib/utils'

interface PatientSearchProps {
  onSelect: (patient: Patient) => void
  practiceId: string
}

export function PatientSearch({ onSelect, practiceId }: PatientSearchProps) {
  const [search, setSearch] = useState('')
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(false)
  const debouncedSearch = useDebounce(search, 300)

  useEffect(() => {
    async function searchPatients() {
      if (!debouncedSearch) {
        setPatients([])
        return
      }

      setLoading(true)
      try {
        const res = await fetch(
          `/api/patients?practiceId=${practiceId}&search=${debouncedSearch}`
        )
        if (!res.ok) throw new Error('Failed to fetch patients')
        const data = await res.json()
        setPatients(data)
      } catch (error) {
        console.error('Error searching patients:', error)
        setPatients([])
      } finally {
        setLoading(false)
      }
    }

    searchPatients()
  }, [debouncedSearch, practiceId])

  return (
    <div className="space-y-2">
      <Input
        type="search"
        placeholder="Search patients..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      
      {loading && <div className="text-sm text-gray-500">Searching...</div>}
      
      {patients.length > 0 && (
        <ul className="mt-2 divide-y divide-gray-200 border rounded-md">
          {patients.map((patient) => (
            <li
              key={patient.id}
              className="p-4 hover:bg-gray-50 cursor-pointer"
              onClick={() => onSelect(patient)}
            >
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">
                    {patient.title} {patient.firstName} {patient.lastName}
                  </p>
                  <p className="text-sm text-gray-500">ID: {patient.idNumber}</p>
                </div>
                {patient.medicalAidNumber && (
                  <div className="text-sm text-gray-500">
                    Medical Aid: {patient.medicalAidNumber}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && debouncedSearch && patients.length === 0 && (
        <div className="text-sm text-gray-500">No patients found</div>
      )}
    </div>
  )
} 