import { defineEventHandler, getRouterParam, getQuery, createError } from '#imports'
import { eq, desc, asc, like, and, sql } from 'drizzle-orm'
import { requireAuth } from '../../../../utils/auth'
import { querySchema } from '../../../../utils/validation'
import { useCmsDatabase, contentSqlite, contentPostgres, translationsSqlite, translationsPostgres, getDatabaseType } from '../../../../database/client'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const name = getRouterParam(event, 'name')
  if (!name) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Collection name is required'
    })
  }

  // Parse query params
  const query = getQuery(event)
  const params = querySchema.parse(query)

  const db = useCmsDatabase()
  const isPostgres = getDatabaseType() === 'postgresql'
  const contentTable = isPostgres ? contentPostgres : contentSqlite
  const translationsTable = isPostgres ? translationsPostgres : translationsSqlite

  // Build where conditions
  const conditions = [
    eq(contentTable.collection, name),
    eq(contentTable.type, 'collection')
  ]

  if (params.status) {
    conditions.push(eq(contentTable.status, params.status))
  }

  // Get total count
  const countResult = await db
    .select({ count: sql<number>`count(*)` })
    .from(contentTable)
    .where(and(...conditions))

  const total = Number(countResult[0]?.count || 0)

  // Calculate pagination
  const offset = (params.page - 1) * params.perPage
  const totalPages = Math.ceil(total / params.perPage)

  // Get items
  let items = await db
    .select()
    .from(contentTable)
    .where(and(...conditions))
    .orderBy(params.orderDir === 'asc' ? asc(contentTable.createdAt) : desc(contentTable.createdAt))
    .limit(params.perPage)
    .offset(offset)

  // Get translations if locale is specified
  if (params.locale) {
    const contentIds = items.map(item => item.id)

    if (contentIds.length > 0) {
      const translations = await db
        .select()
        .from(translationsTable)
        .where(
          and(
            sql`${translationsTable.contentId} IN ${contentIds}`,
            eq(translationsTable.locale, params.locale)
          )
        )

      // Merge translations with items
      const translationsMap = new Map(translations.map(t => [t.contentId, t.data]))

      items = items.map(item => ({
        ...item,
        data: {
          ...item.data,
          ...translationsMap.get(item.id)
        }
      }))
    }
  }

  return {
    data: items,
    meta: {
      total,
      page: params.page,
      perPage: params.perPage,
      totalPages
    }
  }
})
