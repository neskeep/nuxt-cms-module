import { eq, and } from 'drizzle-orm'
import { requireAuth } from '../../../../../utils/auth'
import { useCmsDatabase, contentSqlite, contentPostgres, translationsSqlite, translationsPostgres, getDatabaseType } from '../../../../../database/client'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const name = getRouterParam(event, 'name')
  const id = getRouterParam(event, 'id')

  if (!name || !id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Collection name and ID are required'
    })
  }

  const db = useCmsDatabase()
  const isPostgres = getDatabaseType() === 'postgresql'
  const contentTable = isPostgres ? contentPostgres : contentSqlite
  const translationsTable = isPostgres ? translationsPostgres : translationsSqlite

  // Get content
  const items = await db
    .select()
    .from(contentTable)
    .where(
      and(
        eq(contentTable.id, id),
        eq(contentTable.collection, name)
      )
    )
    .limit(1)

  if (items.length === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Content not found'
    })
  }

  const content = items[0]

  // Get all translations
  const translations = await db
    .select()
    .from(translationsTable)
    .where(eq(translationsTable.contentId, id))

  // Build translations map
  const translationsMap: Record<string, Record<string, unknown>> = {}
  for (const translation of translations) {
    translationsMap[translation.locale] = translation.data
  }

  return {
    ...content,
    translations: translationsMap
  }
})
