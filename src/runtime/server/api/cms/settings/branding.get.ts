import { defineEventHandler } from 'h3'
import { getDatabase } from '../../../utils/db'
import { eq } from 'drizzle-orm'
import * as schema from '../../../database/schema'

export default defineEventHandler(async (event) => {
  const db = getDatabase()

  // Get branding setting from database
  const settings = await db.select()
    .from(schema.settingsSQLite)
    .where(eq(schema.settingsSQLite.key, 'branding'))
    .limit(1)

  if (settings.length === 0) {
    // Return default branding config if not found
    return {
      name: 'CMS',
      logo: '',
      primaryColor: '#2563eb',
      favicon: '',
      login: {
        title: '',
        description: '',
        backgroundImage: ''
      },
      poweredBy: {
        name: 'Neskeep',
        url: ''
      }
    }
  }

  // Parse and return the branding config
  return JSON.parse(settings[0].value)
})
