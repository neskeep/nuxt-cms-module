import { defineEventHandler, setHeaders, getRequestURL } from '#imports'

/**
 * Security headers middleware for CMS API routes
 * Applies security headers to all /api/cms/* requests
 */
export default defineEventHandler((event) => {
  const url = getRequestURL(event)

  // Only apply to CMS API routes
  if (!url.pathname.startsWith('/api/cms')) {
    return
  }

  // Set security headers
  setHeaders(event, {
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // XSS Protection (legacy browsers)
    'X-XSS-Protection': '1; mode=block',

    // Referrer policy - don't leak URL info
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Permissions policy - restrict browser features
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',

    // Cache control for API responses
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0'
  })

  // In production, add stricter CSP
  if (process.env.NODE_ENV === 'production') {
    setHeaders(event, {
      // Content Security Policy for API
      'Content-Security-Policy': "default-src 'none'; frame-ancestors 'none'",

      // HTTP Strict Transport Security
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains'
    })
  }
})
