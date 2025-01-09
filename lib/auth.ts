import { createHash } from 'crypto'

export function hashPassword(password: string): string {
  return createHash('sha256').update(password).digest('hex')
}

export function verifyPassword(password: string, hash: string): boolean {
  const inputHash = hashPassword(password)
  return inputHash === hash
} 