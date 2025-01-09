import { PrismaClient, Prisma } from '@prisma/client'
import { logError } from '@/lib/error'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prismaOptions: Prisma.PrismaClientOptions = {
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn'] as Prisma.LogLevel[]
    : ['error'] as Prisma.LogLevel[],
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient(prismaOptions)

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

// Handle graceful shutdown
process.on('beforeExit', async () => {
  try {
    await prisma.$disconnect()
  } catch (error) {
    logError(error, 'Database disconnect error')
  }
})

// Handle uncaught errors
process.on('uncaughtException', async (error) => {
  logError(error, 'Uncaught exception in database')
  try {
    await prisma.$disconnect()
  } finally {
    process.exit(1)
  }
})

// Handle unhandled rejections
process.on('unhandledRejection', async (error) => {
  logError(error, 'Unhandled rejection in database')
  try {
    await prisma.$disconnect()
  } finally {
    process.exit(1)
  }
}) 