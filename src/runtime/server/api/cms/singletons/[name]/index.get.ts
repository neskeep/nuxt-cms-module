import { defineEventHandler, getRouterParam, getQuery, createError } from '#imports'
import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../../../utils/auth'
import { useCmsDatabase, contentSqlite, contentPostgres, translationsSqlite, translationsPostgres, getDatabaseType } from '../../../../database/client'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const name = getRouterParam(event, 'name')
  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Singleton name is required'
    })
  }

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
    // Return empty singleton structure
    return {
      id: null,
      collection: name,
      data: {},
      translations: {}
    }
  }

  const content = items[0]

  // Get all translations
  const translations = await db
    .select()
    .from(translationsTable)
    .where(eq(translationsTable.contentId, content.id))

  // Build translations map
  const translationsMap: Record<string, Record<string, unknown>> = {}
  for (const translation of translations) {
    translationsMap[translation.locale] = translation.data
  }

  // If locale specified, merge translation with base data
  let data = content.data
  if (locale && translationsMap[locale]) {
    data = { ...data, ...translationsMap[locale] }
  }

  return {
    ...content,
    data,
    translations: translationsMap
  }
})
