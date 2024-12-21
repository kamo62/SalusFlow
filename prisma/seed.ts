import { PrismaClient } from '@prisma/client'
import { createClient } from '@supabase/supabase-js'

const prisma = new PrismaClient()
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function main() {
  // Try to get existing super admin from Supabase
  const { data: { users }, error: searchError } = await supabase.auth.admin.listUsers()
  let authUser = users?.find(u => u.email === 'super.admin@practicemanager.co.za')

  if (!authUser) {
    // Create super admin in Supabase if doesn't exist
    const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
      email: 'super.admin@practicemanager.co.za',
      password: 'SuperSecure123!', // You should change this immediately after deployment
      email_confirm: true,
    })

    if (authError) {
      console.error('Failed to create Supabase user:', authError)
      return
    }
    authUser = newUser.user
  }

  // Check if user exists in our database
  let superAdmin = await prisma.user.findUnique({
    where: { email: authUser.email! }
  })

  if (!superAdmin) {
    // Create super admin in our database if doesn't exist
    superAdmin = await prisma.user.create({
      data: {
        id: authUser.id,
        email: authUser.email!,
        name: 'Super Admin',
        role: 'SUPERADMIN',
      },
    })
  }

  // Create or find demo practice
  let demoPractice = await prisma.practice.findFirst({
    where: { name: 'Demo Medical Practice' }
  })

  if (!demoPractice) {
    demoPractice = await prisma.practice.create({
      data: {
        name: 'Demo Medical Practice',
        address: '123 Healthcare Street, Johannesburg',
        phone: '+27 11 123 4567',
        email: 'info@demopractice.co.za',
        website: 'https://demopractice.co.za',
        settings: {
          workingHours: {
            monday: { start: '08:00', end: '17:00' },
            tuesday: { start: '08:00', end: '17:00' },
            wednesday: { start: '08:00', end: '17:00' },
            thursday: { start: '08:00', end: '17:00' },
            friday: { start: '08:00', end: '17:00' },
          },
          timezone: 'Africa/Johannesburg',
          currency: 'ZAR',
        },
      },
    })

    // Link super admin to practice
    await prisma.practiceUser.create({
      data: {
        userId: superAdmin.id,
        practiceId: demoPractice.id,
        role: 'OWNER',
      },
    })
  }

  // Create consultation types if they don't exist
  const consultationTypeNames = ['General Consultation', 'Follow-up', 'Specialist Consultation']
  const consultationTypes = await Promise.all(
    consultationTypeNames.map(async (name) => {
      const existing = await prisma.consultationType.findFirst({
        where: { name, practiceId: demoPractice.id }
      })

      if (existing) return existing

      return prisma.consultationType.create({
        data: {
          name,
          description: `${name} description`,
          durationMinutes: name === 'Specialist Consultation' ? 60 : name === 'Follow-up' ? 15 : 30,
          practiceId: demoPractice.id,
        },
      })
    })
  )

  // Try to get existing doctor from Supabase
  const doctorEmail = 'doctor@demopractice.co.za'
  let doctorAuth = users?.find(u => u.email === doctorEmail)

  if (!doctorAuth) {
    // Create a demo doctor in Supabase if doesn't exist
    const { data: newDoctor, error: doctorError } = await supabase.auth.admin.createUser({
      email: doctorEmail,
      password: 'Doctor123!', // Change this after deployment
      email_confirm: true,
    })

    if (doctorError) {
      console.error('Failed to create doctor user:', doctorError)
      return
    }
    doctorAuth = newDoctor.user
  }

  // Check if doctor exists in our database
  let doctorUser = await prisma.user.findUnique({
    where: { email: doctorAuth.email! }
  })

  if (!doctorUser) {
    // Create doctor in our database
    doctorUser = await prisma.user.create({
      data: {
        id: doctorAuth.id,
        email: doctorAuth.email!,
        name: 'Dr. Sarah Smith',
        role: 'DOCTOR',
      },
    })
  }

  // Create or find doctor profile
  let doctor = await prisma.doctor.findUnique({
    where: { userId: doctorUser.id }
  })

  if (!doctor) {
    doctor = await prisma.doctor.create({
      data: {
        userId: doctorUser.id,
        practiceId: demoPractice.id,
        speciality: 'General Practice',
      },
    })

    // Link doctor to practice
    await prisma.practiceUser.create({
      data: {
        userId: doctorUser.id,
        practiceId: demoPractice.id,
        role: 'DOCTOR',
      },
    })

    // Set up doctor's consultation fees
    await Promise.all(
      consultationTypes.map((type) =>
        prisma.doctorConsultationType.create({
          data: {
            doctorId: doctor!.id,
            consultationTypeId: type.id,
            fee: type.name === 'Specialist Consultation' ? 1200 : type.name === 'General Consultation' ? 800 : 500,
          },
        })
      )
    )
  }

  // Create demo patients if they don't exist
  const patientEmails = ['john.doe@example.com', 'jane.smith@example.com']
  const patients = await Promise.all(
    patientEmails.map(async (email, index) => {
      const existing = await prisma.patient.findFirst({
        where: { email, practiceId: demoPractice.id }
      })

      if (existing) return existing

      return prisma.patient.create({
        data: {
          practiceId: demoPractice.id,
          firstName: index === 0 ? 'John' : 'Jane',
          lastName: index === 0 ? 'Doe' : 'Smith',
          email,
          phone: index === 0 ? '+27 82 123 4567' : '+27 83 234 5678',
          dateOfBirth: new Date(index === 0 ? '1980-01-01' : '1990-05-15'),
        },
      })
    })
  )

  console.log({
    message: 'Seed data created/updated successfully',
    superAdmin: { email: superAdmin.email },
    practice: { name: demoPractice.name },
    doctor: { email: doctorUser.email },
    consultationTypes: consultationTypes.map(t => t.name),
    patients: patients.map(p => `${p.firstName} ${p.lastName}`),
  })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 