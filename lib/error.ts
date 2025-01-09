export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_SERVER_ERROR'
  ) {
    super(message)
    this.name = 'AppError'
  }
}

export function logError(error: unknown, context?: string) {
  const timestamp = new Date().toISOString()
  const errorMessage = error instanceof Error ? error.message : String(error)
  const errorStack = error instanceof Error ? error.stack : undefined
  
  // In production, you'd want to use a proper logging service
  console.error(JSON.stringify({
    timestamp,
    context,
    error: errorMessage,
    stack: errorStack,
  }))
}

export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return {
      error: error.message,
      code: error.code,
      status: error.statusCode,
    }
  }

  // Log unknown errors
  logError(error)

  return {
    error: 'An unexpected error occurred',
    code: 'INTERNAL_SERVER_ERROR',
    status: 500,
  }
} 