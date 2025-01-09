import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'

async function createTestUser() {
  const testUser = {
    email: 'jd@example.com',
    password: 'password1!',
    name: 'John Doe'
  }

  try {
    const passwordHash = hashPassword(testUser.password)
    console.log('Test user credentials:')
    console.log('Email:', testUser.email)
    console.log('Password:', testUser.password)
    console.log('Generated hash:', passwordHash)

    const user = await prisma.user.upsert({
      where: { email: testUser.email },
      update: {
        passwordHash,
        name: testUser.name
      },
      create: {
        email: testUser.email,
        passwordHash,
        name: testUser.name
      }
    })

    console.log('Test user created/updated:', user)
  } catch (error) {
    console.error('Error creating test user:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createTestUser() 