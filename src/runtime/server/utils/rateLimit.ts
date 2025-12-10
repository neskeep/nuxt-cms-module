import { createError, getRequestIP } from '#imports'

/**
 * Rate limit configuration
 */
export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number
  /** Maximum number of requests per window */
  max: number
  /** Error message when limit is exceeded */
  message?: string
}

/**
 * Rate limit store entry
 */
interface RateLimitEntry {
  count: number
  resetTime: number
}

/**
 * In-memory rate limit store
 * In production, consider using Redis for distributed systems
 */
const rateLimitStore = new Map<string, RateLimitEntry>()

/**
 * Clean up expired entries periodically
 */
function cleanupExpiredEntries() {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    if (entry.resetTime < now) {
      rateLimitStore.delete(key)
    }
  }
}

// Run cleanup every 5 minutes
setInterval(cleanupExpiredEntries, 5 * 60 * 1000)

/**
 * Default rate limit configurations
 */
export const RATE_LIMITS = {
  /** Login endpoint: 5 attempts per 15 minutes */
  login: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many login attempts. Please try again later.'
  },
  /** API endpoints: 100 requests per minute */
  api: {
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: 'Too many requests. Please slow down.'
  },
  /** Upload endpoint: 20 uploads per hour */
  upload: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20,
    message: 'Upload limit exceeded. Please try again later.'
  }
} as const

/**
 * Get client identifier for rate limiting
 */
function getClientIdentifier(event: any, prefix: string): string {
  const ip = getRequestIP(event, { xForwardedFor: true }) || 'unknown'
  return `${prefix}:${ip}`
}

/**
 * Check rate limit for a request
 * @returns true if request is allowed, throws error if limit exceeded
 */
export function checkRateLimit(
  event: any,
  config: RateLimitConfig,
  prefix: string = 'default'
): boolean {
  const key = getClientIdentifier(event, prefix)
  const now = Date.now()

  let entry = rateLimitStore.get(key)

  // Create new entry or reset if window expired
  if (!entry || entry.resetTime < now) {
    entry = {
      count: 1,
      resetTime: now + config.windowMs
    }
    rateLimitStore.set(key, entry)
    return true
  }

  // Increment count
  entry.count++

  // Check if limit exceeded
  if (entry.count > config.max) {
    const retryAfter = Math.ceil((entry.resetTime - now) / 1000)

    throw createError({
      statusCode: 429,
      statusMessage: 'Too Many Requests',
      message: config.message || 'Rate limit exceeded',
      data: {
        retryAfter,
        limit: config.max,
        remaining: 0,
        reset: new Date(entry.resetTime).toISOString()
      }
    })
  }

  return true
}

/**
 * Get rate limit info without checking
 */
export function getRateLimitInfo(
  event: any,
  config: RateLimitConfig,
  prefix: string = 'default'
): { remaining: number; reset: Date; limit: number } {
  const key = getClientIdentifier(event, prefix)
  const now = Date.now()
  const entry = rateLimitStore.get(key)

  if (!entry || entry.resetTime < now) {
    return {
      remaining: config.max,
      reset: new Date(now + config.windowMs),
      limit: config.max
    }
  }

  return {
    remaining: Math.max(0, config.max - entry.count),
    reset: new Date(entry.resetTime),
    limit: config.max
  }
}

/**
 * Reset rate limit for a specific client
 * Useful after successful authentication
 */
export function resetRateLimit(event: any, prefix: string = 'default'): void {
  const key = getClientIdentifier(event, prefix)
  rateLimitStore.delete(key)
}

/**
 * Middleware-style rate limiter
 */
export function createRateLimiter(config: RateLimitConfig, prefix: string = 'default') {
  return (event: any) => checkRateLimit(event, config, prefix)
}
