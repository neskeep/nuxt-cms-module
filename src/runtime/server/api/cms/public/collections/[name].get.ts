import { defineEventHandler, getRouterParam, getQuery } from '#imports'
import { eq, and, desc, asc, like } from 'drizzle-orm'
import { useCmsDatabase, contentSqlite, contentPostgres, translationsSqlite, translationsPostgres, getDatabaseType } from '../../../../database/client'
import { sanitizeSearchQuery, sanitizeText } from '../../../../utils/validation'

/**
 * Public API endpoint for fetching collection items
 * Only returns published items by default (for public consumption)
 * No authentication required
 */
export default defineEventHandler(async (event) => {
  const rawName = getRouterParam(event, 'name')
  if (!rawName) {
    return { items: [], total: 0 }
  }
  // Sanitize collection name to prevent injection
  const name = sanitizeText(rawName)

  const query = getQuery(event)
  const page = parseInt(query.page as string) || 1
  const limit = Math.min(parseInt(query.limit as string) || 20, 100)
  const offset = (page - 1) * limit
  const locale = query.locale as string | undefined
  const sort = query.sort as string || '-createdAt'
  // Sanitize search query to prevent abuse
  const rawSearch = query.search as string | undefined
  const search = rawSearch ? sanitizeSearchQuery(rawSearch) : undefined
  // For public API, default to published only
  const status = query.status as string || 'published'

  const db = useCmsDatabase()
  const isPostgres = getDatabaseType() === 'postgresql'
  const contentTable = isPostgres ? contentPostgres : contentSqlite
  const translationsTable = isPostgres ? translationsPostgres : translationsSqlite

  // Build where conditions
  const conditions = [
    eq(contentTable.collection, name),
    eq(contentTable.type, 'collection')
  ]

  // Only show published items for public API (can be overridden with ?status=all)
  if (status !== 'all') {
    conditions.push(eq(contentTable.status, status))
  }

  // Determine sort order
  const sortField = sort.startsWith('-') ? sort.slice(1) : sort
  const sortOrder = sort.startsWith('-') ? 'desc' : 'asc'

  // Get items with pagination
  let items = await db
    .select()
    .from(contentTable)
    .where(and(...conditions))
    .orderBy(sortOrder === 'desc' ? desc(contentTable.createdAt) : asc(contentTable.createdAt))
    .limit(limit)
    .offset(offset)

  // Get total count
  const countResult = await db
    .select()
    .from(contentTable)
    .where(and(...conditions))

  const total = countResult.length

  // Get translations for each item
  // Always try to get translations (use specified locale or any available)
  const itemIds = items.map(item => item.id)
  if (itemIds.length > 0) {
    // Get all translations for these items
    const allTranslations = await db
      .select()
      .from(translationsTable)

    // Merge translations with items
    items = items.map(item => {
      // If locale specified, use that translation
      // Otherwise, use the first available translation for this item
      const translation = locale
        ? allTranslations.find(t => t.contentId === item.id && t.locale === locale)
        : allTranslations.find(t => t.contentId === item.id)

      if (translation) {
        return {
          ...item,
          data: { ...item.data, ...translation.data }
        }
      }
      return item
    })
  }

  // Filter by search if provided (search in title field of data)
  if (search) {
    items = items.filter(item => {
      const data = item.data as Record<string, unknown>
      const title = data?.title as string || ''
      return title.toLowerCase().includes(search.toLowerCase())
    })
  }

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit)
  }
})
