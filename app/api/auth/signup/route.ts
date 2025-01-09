import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword } from '@/lib/auth'
import type { SignUpRequest, AuthResponse } from '@/types/api'

export async function POST(request: Request) {
  try {
    const body: SignUpRequest = await request.json()
    const { email, password, name } = body

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      )
    }

    // Create new user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: hashPassword(password),
        name
      }
    })

    const response: AuthResponse = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Sign-up error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 