import { defineEventHandler, readBody, createError } from '#imports'
import { loginUser, setAuthCookie, validateJwtSecret } from '../../../utils/auth'
import { loginSchema } from '../../../utils/validation'
import { checkRateLimit, resetRateLimit, RATE_LIMITS } from '../../../utils/rateLimit'

export default defineEventHandler(async (event) => {
  // Validate JWT secret is configured
  validateJwtSecret()

  // Check rate limit before processing
  checkRateLimit(event, RATE_LIMITS.login, 'login')

  const body = await readBody(event)

  // Validate input
  const result = loginSchema.safeParse(body)
  if (!result.success) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid input',
      data: result.error.flatten()
    })
  }

  const { username, password } = result.data

  // Attempt login
  const loginResult = await loginUser(username, password)

  if (!loginResult) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials'
    })
  }

  // Reset rate limit on successful login
  resetRateLimit(event, 'login')

  // Set auth cookie
  setAuthCookie(event, loginResult.token)

  return {
    success: true,
    user: loginResult.user
  }
})
