/**
 * Content status
 */
export type ContentStatus = 'draft' | 'published' | 'archived'

/**
 * Content type
 */
export type ContentType = 'collection' | 'singleton'

/**
 * Base content item stored in database
 */
export interface ContentItem {
  /** Unique identifier (nanoid) */
  id: string
  /** Type of content */
  type: ContentType
  /** Collection or singleton name */
  collection: string
  /** Non-translatable field data */
  data: Record<string, unknown>
  /** Content status */
  status: ContentStatus
  /** Sort order */
  sortOrder: number
  /** Creation timestamp */
  createdAt: Date
  /** Last update timestamp */
  updatedAt: Date
  /** Publication timestamp */
  publishedAt: Date | null
  /** Creator user ID */
  createdBy: string | null
}

/**
 * Content translation stored in database
 */
export interface ContentTranslation {
  /** Unique identifier */
  id: string
  /** Reference to content item */
  contentId: string
  /** Locale code */
  locale: string
  /** Translated field data */
  data: Record<string, unknown>
  /** Creation timestamp */
  createdAt: Date
  /** Last update timestamp */
  updatedAt: Date
}

/**
 * Content item with translations merged
 */
export interface ContentWithTranslations extends ContentItem {
  /** Translations by locale */
  translations: Record<string, Record<string, unknown>>
}

/**
 * Resolved content for a specific locale
 */
export interface ResolvedContent {
  /** Unique identifier */
  id: string
  /** Collection or singleton name */
  collection: string
  /** Merged data (non-translatable + translated) */
  data: Record<string, unknown>
  /** Content status */
  status: ContentStatus
  /** Current locale */
  locale: string
  /** Metadata */
  meta: {
    createdAt: Date
    updatedAt: Date
    publishedAt: Date | null
    createdBy: string | null
  }
}

/**
 * Input for creating content
 */
export interface CreateContentInput {
  /** Collection or singleton name */
  collection: string
  /** Non-translatable field data */
  data: Record<string, unknown>
  /** Translations by locale */
  translations?: Record<string, Record<string, unknown>>
  /** Initial status */
  status?: ContentStatus
}

/**
 * Input for updating content
 */
export interface UpdateContentInput {
  /** Non-translatable field data */
  data?: Record<string, unknown>
  /** Translations by locale */
  translations?: Record<string, Record<string, unknown>>
  /** New status */
  status?: ContentStatus
}

/**
 * Query options for fetching collections
 */
export interface ContentQueryOptions {
  /** Filter conditions */
  where?: Record<string, unknown>
  /** Sort configuration */
  orderBy?: Record<string, 'asc' | 'desc'>
  /** Number of items to return */
  limit?: number
  /** Number of items to skip */
  offset?: number
  /** Locale for translations */
  locale?: string
  /** Include drafts */
  includeDrafts?: boolean
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  /** Items */
  data: T[]
  /** Pagination info */
  meta: {
    total: number
    page: number
    perPage: number
    totalPages: number
  }
}
