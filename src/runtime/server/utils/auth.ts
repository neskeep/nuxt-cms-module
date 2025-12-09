import { useRuntimeConfig, getCookie, getHeader, setCookie, deleteCookie, createError } from '#imports'
import { SignJWT, jwtVerify } from 'jose'
import bcrypt from 'bcryptjs'
import { nanoid } from 'nanoid'
import { eq } from 'drizzle-orm'
import { useCmsDatabase, usersSqlite, usersPostgres, getDatabaseType } from '../database/client'
import type { SafeCmsUser, JwtPayload, UserRole } from '../../types'

const BCRYPT_ROUNDS = 12
const JWT_EXPIRATION = '7d'
const COOKIE_NAME = 'cms_session'

/**
 * Hash a password
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_ROUNDS)
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

/**
 * Create a JWT token
 */
export async function createToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): Promise<string> {
  const config = useRuntimeConfig()
  const secret = new TextEncoder().encode(config.cms.jwtSecret)

  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(JWT_EXPIRATION)
    .sign(secret)
}

/**
 * Verify and decode a JWT token
 */
export async function verifyToken(token: string): Promise<JwtPayload | null> {
  const config = useRuntimeConfig()
  const secret = new TextEncoder().encode(config.cms.jwtSecret)

  try {
    const { payload } = await jwtVerify(token, secret)
    return payload as unknown as JwtPayload
  } catch {
    return null
  }
}

/**
 * Get user from event (from cookie or authorization header)
 */
export async function getUserFromEvent(event: any): Promise<SafeCmsUser | null> {
  // Try cookie first
  let token = getCookie(event, COOKIE_NAME)

  // Try Authorization header
  if (!token) {
    const authHeader = getHeader(event, 'authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.slice(7)
    }
  }

  if (!token) return null

  const payload = await verifyToken(token)
  if (!payload) return null

  // Get user from database
  const db = useCmsDatabase()
  const usersTable = getDatabaseType() === 'postgresql' ? usersPostgres : usersSqlite

  const users = await db.select().from(usersTable).where(eq(usersTable.id, payload.sub)).limit(1)

  if (users.length === 0) return null

  const user = users[0]
  if (!user.active) return null

  return {
    id: user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    active: user.active,
    lastLogin: user.lastLogin,
    createdAt: user.createdAt
  }
}

/**
 * Require authentication for an event
 */
export async function requireAuth(event: any): Promise<SafeCmsUser> {
  const user = await getUserFromEvent(event)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Unauthorized'
    })
  }

  return user
}

/**
 * Set authentication cookie
 */
export function setAuthCookie(event: any, token: string) {
  setCookie(event, COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/'
  })
}

/**
 * Clear authentication cookie
 */
export function clearAuthCookie(event: any) {
  deleteCookie(event, COOKIE_NAME, {
    path: '/'
  })
}

/**
 * Create initial admin user if it doesn't exist
 */
export async function createInitialAdmin(username: string, password: string): Promise<void> {
  const db = useCmsDatabase()
  const usersTable = getDatabaseType() === 'postgresql' ? usersPostgres : usersSqlite

  // Check if admin already exists
  const existing = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1)

  if (existing.length > 0) {
    console.log('[CMS] Admin user already exists')
    return
  }

  // Create admin user
  const passwordHash = await hashPassword(password)
  const now = new Date()

  await db.insert(usersTable).values({
    id: nanoid(),
    username,
    passwordHash,
    role: 'admin',
    active: true,
    createdAt: now,
    updatedAt: now
  })

  console.log('[CMS] Initial admin user created')
}

/**
 * Login user
 */
export async function loginUser(username: string, password: string): Promise<{ user: SafeCmsUser; token: string } | null> {
  const db = useCmsDatabase()
  const usersTable = getDatabaseType() === 'postgresql' ? usersPostgres : usersSqlite

  // Find user
  const users = await db.select().from(usersTable).where(eq(usersTable.username, username)).limit(1)

  if (users.length === 0) return null

  const user = users[0]

  // Check if active
  if (!user.active) return null

  // Verify password
  const valid = await verifyPassword(password, user.passwordHash)
  if (!valid) return null

  // Update last login
  await db.update(usersTable)
    .set({ lastLogin: new Date() })
    .where(eq(usersTable.id, user.id))

  // Create token
  const token = await createToken({
    sub: user.id,
    username: user.username,
    role: user.role as UserRole
  })

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      active: user.active,
      lastLogin: new Date(),
      createdAt: user.createdAt
    },
    token
  }
}
