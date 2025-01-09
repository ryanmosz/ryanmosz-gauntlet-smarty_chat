import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { CreateChatSessionRequest, ChatSessionResponse } from '@/types/api'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    const response: ChatSessionResponse[] = sessions.map(session => ({
      id: session.id,
      title: session.title,
      createdAt: session.createdAt.toISOString(),
      messages: session.messages.map(msg => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
        createdAt: msg.createdAt.toISOString()
      }))
    }))

    return NextResponse.json(response)
  } catch (error) {
    console.error('Get chat sessions error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const body: CreateChatSessionRequest = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const session = await prisma.chatSession.create({
      data: {
        userId,
        title: body.title
      },
      include: {
        messages: true
      }
    })

    const response: ChatSessionResponse = {
      id: session.id,
      title: session.title,
      createdAt: session.createdAt.toISOString(),
      messages: []
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Create chat session error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 