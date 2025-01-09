import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// In-memory store for rate limiting
const rateLimit = new Map<string, { count: number; resetTime: number }>()

// Rate limit configuration
const RATE_LIMIT_MAX = process.env.RATE_LIMIT_MAX ? parseInt(process.env.RATE_LIMIT_MAX) : 100
const RATE_LIMIT_WINDOW_MS = process.env.RATE_LIMIT_WINDOW_MS ? parseInt(process.env.RATE_LIMIT_WINDOW_MS) : 60000

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // Add security headers
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')

  // Handle CORS for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    const origin = request.headers.get('origin')
    const allowedOrigins = process.env.CORS_ORIGINS?.split(',') || []

    if (origin && allowedOrigins.includes(origin)) {
      response.headers.set('Access-Control-Allow-Origin', origin)
      response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
      response.headers.set('Access-Control-Max-Age', '86400')
    }

    // Handle rate limiting for API routes
    const ip = request.ip || 'unknown'
    const now = Date.now()
    const rateData = rateLimit.get(ip)

    if (rateData) {
      if (now > rateData.resetTime) {
        // Reset rate limit
        rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
      } else if (rateData.count >= RATE_LIMIT_MAX) {
        // Rate limit exceeded
        return new NextResponse(
          JSON.stringify({ error: 'Too many requests', code: 'RATE_LIMIT_EXCEEDED' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        )
      } else {
        // Increment request count
        rateLimit.set(ip, { count: rateData.count + 1, resetTime: rateData.resetTime })
      }
    } else {
      // First request from this IP
      rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS })
    }

    // Add rate limit headers
    const currentLimit = rateLimit.get(ip)
    if (currentLimit) {
      response.headers.set('X-RateLimit-Limit', RATE_LIMIT_MAX.toString())
      response.headers.set('X-RateLimit-Remaining', (RATE_LIMIT_MAX - currentLimit.count).toString())
      response.headers.set('X-RateLimit-Reset', currentLimit.resetTime.toString())
    }
  }

  return response
}

export const config = {
  matcher: [
    '/api/:path*',
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 