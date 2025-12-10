import { defineEventHandler, createError } from '#imports'
import { requireAuth, clearAuthCookie } from '../../../utils/auth'

/**
 * Invalidate current session (logout)
 * In a full implementation, this would also invalidate the token in a blacklist/sessions table
 */
export default defineEventHandler(async (event) => {
  // Require authentication
  const user = await requireAuth(event)

  // Clear the auth cookie
  clearAuthCookie(event)

  // TODO: In Phase 2 (RBAC), we'll add token blacklisting here
  // This will require a sessions table to track and invalidate tokens

  return {
    success: true,
    message: 'Session invalidated successfully',
    user: {
      id: user.id,
      username: user.username
    }
  }
})
