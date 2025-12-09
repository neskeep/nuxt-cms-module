import { loginUser, setAuthCookie } from '../../../utils/auth'
import { loginSchema } from '../../../utils/validation'

export default defineEventHandler(async (event) => {
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

  // Set auth cookie
  setAuthCookie(event, loginResult.token)

  return {
    success: true,
    user: loginResult.user
  }
})
