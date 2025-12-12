import { defineEventHandler, readBody, createError } from 'h3'
import { eq } from 'drizzle-orm'
import { useCmsDatabase, settingsSQLite, settingsPostgres, getDatabaseType } from '../../../database/client'

export default defineEventHandler(async (event) => {
  const db = useCmsDatabase()
  const isPostgres = getDatabaseType() === 'postgresql'
  const settingsTable = isPostgres ? settingsPostgres : settingsSQLite
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
    .from(settingsTable)
    .where(eq(settingsTable.key, 'branding'))
    .limit(1)

  if (existing.length > 0) {
    // Update existing setting
    await db.update(settingsTable)
      .set({
        value: brandingValue,
        updatedAt: now
      })
      .where(eq(settingsTable.key, 'branding'))
  } else {
    // Insert new setting
    await db.insert(settingsTable).values({
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
