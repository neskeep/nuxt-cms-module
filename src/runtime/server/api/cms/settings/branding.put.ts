import { defineEventHandler, readBody, createError } from 'h3'
import { getDatabase } from '../../../utils/db'
import { eq } from 'drizzle-orm'
import * as schema from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const db = getDatabase()
  const body = await readBody(event)

  if (!body) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Request body is required'
    })
  }

  const now = new Date()
  const brandingValue = JSON.stringify(body)

  // Check if branding setting already exists
  const existing = await db.select()
    .from(schema.settingsSQLite)
    .where(eq(schema.settingsSQLite.key, 'branding'))
    .limit(1)

  if (existing.length > 0) {
    // Update existing setting
    await db.update(schema.settingsSQLite)
      .set({
        value: brandingValue,
        updatedAt: now
      })
      .where(eq(schema.settingsSQLite.key, 'branding'))
  } else {
    // Insert new setting
    await db.insert(schema.settingsSQLite).values({
      key: 'branding',
      value: brandingValue,
      createdAt: now,
      updatedAt: now
    })
  }

  return {
    success: true,
    message: 'Branding settings saved successfully'
  }
})
