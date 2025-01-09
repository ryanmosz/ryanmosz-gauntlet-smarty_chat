import { Role } from '@prisma/client'

export interface LoginRequest {
  email: string
  password: string
}

export interface SignUpRequest {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  id: string
  email: string
  name: string
  avatarUrl: string | null
}

export interface ChatSessionResponse {
  id: string
  title: string | null
  createdAt: string
  messages: MessageResponse[]
}

export interface MessageResponse {
  id: string
  role: Role
  content: string
  createdAt: string
}

export interface CreateChatSessionRequest {
  title?: string
}

export interface CreateMessageRequest {
  content: string
  chatSessionId: string
} 