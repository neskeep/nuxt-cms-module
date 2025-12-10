import { defineEventHandler, getRouterParam, getQuery } from '#imports'
import { eq, and } from 'drizzle-orm'
import { useCmsDatabase, contentSqlite, contentPostgres, translationsSqlite, translationsPostgres, getDatabaseType } from '../../../../database/client'
import { sanitizeText } from '../../../../utils/validation'

/**
 * Public API endpoint for fetching singleton data
 * No authentication required
 */
export default defineEventHandler(async (event) => {
  const rawName = getRouterParam(event, 'name')
  if (!rawName) {
    return { data: {} }
  }
  // Sanitize singleton name to prevent injection
  const name = sanitizeText(rawName)

  const query = getQuery(event)
  const locale = query.locale as string | undefined

  const db = useCmsDatabase()
  const isPostgres = getDatabaseType() === 'postgresql'
  const contentTable = isPostgres ? contentPostgres : contentSqlite
  const translationsTable = isPostgres ? translationsPostgres : translationsSqlite

  // Get singleton
  const items = await db
    .select()
    .from(contentTable)
    .where(
      and(
        eq(contentTable.collection, name),
        eq(contentTable.type, 'singleton')
      )
    )
    .limit(1)

  if (items.length === 0) {
    return {
      id: null,
      collection: name,
      data: {}
    }
  }

  const content = items[0]

  // Get translations - always try to merge with content data
  let data = content.data
  const translations = await db
    .select()
    .from(translationsTable)
    .where(eq(translationsTable.contentId, content.id))

  if (translations.length > 0) {
    // If locale specified, use that translation; otherwise use first available
    const translation = locale
      ? translations.find(t => t.locale === locale)
      : translations[0]

    if (translation) {
      data = { ...data, ...translation.data }
    }
  }

  return {
    id: content.id,
    collection: name,
    data
  }
})
