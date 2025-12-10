import { ref, computed } from 'vue'
import { useFetch, useAsyncData } from '#imports'
import type { ContentQueryOptions, PaginatedResponse, ResolvedContent } from '../types'

export interface UseCmsCollectionOptions extends ContentQueryOptions {
  /** Unique key for caching */
  key?: string
  /** Watch for query changes */
  watch?: boolean
  /** Lazy load (don't fetch immediately) */
  lazy?: boolean
  /** Use authenticated API (for admin) instead of public API */
  authenticated?: boolean
  /** Filter by status (default: 'published' for public, 'all' for authenticated) */
  status?: 'published' | 'draft' | 'all'
  /** Sort field (prefix with - for descending, e.g. '-createdAt') */
  sort?: string
  /** Search query */
  search?: string
}

/**
 * Composable for fetching collection items
 * Uses public API by default (no auth required, only published items)
 * Set authenticated: true for admin panel usage
 */
export function useCmsCollection<T = Record<string, unknown>>(
  collection: string,
  options: UseCmsCollectionOptions = {}
) {
  const {
    where,
    orderBy,
    limit,
    offset,
    locale,
    includeDrafts = false,
    key,
    lazy = false,
    authenticated = false,
    status,
    sort,
    search
  } = options

  // Determine API endpoint (public vs authenticated)
  const apiBase = authenticated ? '/api/cms/collections' : '/api/cms/public/collections'

  // Build query params
  const queryParams = computed(() => {
    const params: Record<string, string | number | boolean> = {}

    if (limit) params.limit = limit
    if (offset) params.page = Math.floor(offset / (limit || 20)) + 1
    if (locale) params.locale = locale
    if (status) params.status = status
    if (sort) params.sort = sort
    if (search) params.search = search

    // Legacy support for includeDrafts
    if (includeDrafts && !status) params.status = 'all'

    if (orderBy) {
      const [field, direction] = Object.entries(orderBy)[0] || []
      if (field) {
        params.orderBy = field
        params.orderDir = direction || 'desc'
      }
    }

    return params
  })

  // Fetch data
  const { data: rawData, pending, error, refresh } = useAsyncData(
    key || `cms-collection-${collection}-${authenticated ? 'auth' : 'public'}`,
    () => $fetch(`${apiBase}/${collection}`, {
      params: queryParams.value
    }),
    {
      lazy,
      watch: options.watch ? [queryParams] : undefined
    }
  )

  // Computed values - handle both response formats
  const data = computed(() => {
    if (!rawData.value) return []
    // Public API returns { items, total, page, ... }
    // Authenticated API returns { data, meta }
    return (rawData.value as any).items || (rawData.value as any).data || []
  })

  const items = computed(() => data.value as T[])
  const total = computed(() => (rawData.value as any)?.total || (rawData.value as any)?.meta?.total || 0)
  const page = computed(() => (rawData.value as any)?.page || (rawData.value as any)?.meta?.page || 1)
  const totalPages = computed(() => (rawData.value as any)?.totalPages || (rawData.value as any)?.meta?.totalPages || 0)
  const meta = computed(() => ({
    total: total.value,
    page: page.value,
    totalPages: totalPages.value
  }))

  /**
   * Fetch a single item by ID
   */
  async function fetchById(id: string, itemLocale?: string): Promise<T | null> {
    try {
      const result = await $fetch<T>(`/api/cms/collections/${collection}/${id}`, {
        params: itemLocale ? { locale: itemLocale } : undefined
      })
      return result
    } catch {
      return null
    }
  }

  /**
   * Create a new item
   */
  async function create(itemData: Partial<T>, translations?: Record<string, Partial<T>>) {
    return $fetch(`/api/cms/collections/${collection}`, {
      method: 'POST',
      body: {
        data: itemData,
        translations
      }
    })
  }

  /**
   * Update an item
   */
  async function update(id: string, itemData: Partial<T>, translations?: Record<string, Partial<T>>) {
    return $fetch(`/api/cms/collections/${collection}/${id}`, {
      method: 'PUT',
      body: {
        data: itemData,
        translations
      }
    })
  }

  /**
   * Delete an item
   */
  async function remove(id: string) {
    return $fetch(`/api/cms/collections/${collection}/${id}`, {
      method: 'DELETE'
    })
  }

  return {
    // Data
    data,
    items,
    meta,
    total,
    page,
    totalPages,

    // State
    pending,
    error,

    // Actions
    refresh,
    fetchById,
    create,
    update,
    remove
  }
}

/**
 * Shorthand for fetching a single collection item
 */
export function useCmsCollectionItem<T = Record<string, unknown>>(
  collection: string,
  id: string,
  options: { locale?: string; key?: string } = {}
) {
  const { locale, key } = options

  const { data, pending, error, refresh } = useAsyncData<T>(
    key || `cms-collection-${collection}-${id}`,
    () => $fetch(`/api/cms/collections/${collection}/${id}`, {
      params: locale ? { locale } : undefined
    })
  )

  return {
    data,
    pending,
    error,
    refresh
  }
}
