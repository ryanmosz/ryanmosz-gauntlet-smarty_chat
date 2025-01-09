import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import type { CreateMessageRequest, MessageResponse } from '@/types/api'
import { Role } from '@prisma/client'

export async function POST(request: Request) {
  try {
    const body: CreateMessageRequest = await request.json()
    const { content, chatSessionId } = body

    // Create user message
    const userMessage = await prisma.message.create({
      data: {
        chatSessionId,
        role: Role.user,
        content
      }
    })

    // Here you would typically call your AI service to get a response
    // For now, we'll create a simple echo response
    const assistantMessage = await prisma.message.create({
      data: {
        chatSessionId,
        role: Role.assistant,
        content: `Echo: ${content}`
      }
    })

    // Update chat session's updatedAt
    await prisma.chatSession.update({
      where: { id: chatSessionId },
      data: { updatedAt: new Date() }
    })

    const response: MessageResponse[] = [
      {
        id: userMessage.id,
        role: userMessage.role,
        content: userMessage.content,
        createdAt: userMessage.createdAt.toISOString()
      },
      {
        id: assistantMessage.id,
        role: assistantMessage.role,
        content: assistantMessage.content,
        createdAt: assistantMessage.createdAt.toISOString()
      }
    ]

    return NextResponse.json(response)
  } catch (error) {
    console.error('Create message error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 