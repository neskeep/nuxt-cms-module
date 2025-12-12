import { defineNuxtPlugin, useRuntimeConfig } from '#imports'
import { getDatabase } from '../server/utils/db'
import { eq } from 'drizzle-orm'
import * as schema from '../server/database/schema'

export default defineNuxtPlugin(async () => {
  const config = useRuntimeConfig()

  try {
    const db = getDatabase()

    // Fetch branding settings from database
    const settings = await db.select()
      .from(schema.settingsSQLite)
      .where(eq(schema.settingsSQLite.key, 'branding'))
      .limit(1)

    if (settings.length > 0) {
      // Parse branding config and merge with existing config
      const brandingData = JSON.parse(settings[0].value)

      // Update runtime config with database branding
      config.public.cms.branding = {
        ...config.public.cms.branding,
        ...brandingData
      }
    }
  } catch (error) {
    // Silently fail if database is not available or settings table doesn't exist yet
    console.warn('[CMS] Failed to load branding from database:', error)
  }
})
