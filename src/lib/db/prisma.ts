import { PrismaClient } from '@prisma/client'

// Prisma client with connection pooling
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export async function checkPrismaConnection(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`
    return true
  } catch (error) {
    console.error('Prisma connection check failed:', error)
    return false
  }
}

export async function disconnectPrisma(): Promise<void> {
  await prisma.$disconnect()
}

export async function clearPrismaCache(): Promise<void> {
  await prisma.$executeRaw`PRAGMA foreign_keys = OFF;`
  await prisma.$executeRaw`VACUUM;`
  await prisma.$executeRaw`PRAGMA foreign_keys = ON;`
} 