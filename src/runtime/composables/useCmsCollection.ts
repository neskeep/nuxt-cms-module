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
}

/**
 * Composable for fetching collection items
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
    lazy = false
  } = options

  // Build query params
  const queryParams = computed(() => {
    const params: Record<string, string | number | boolean> = {}

    if (limit) params.perPage = limit
    if (offset) params.page = Math.floor(offset / (limit || 20)) + 1
    if (locale) params.locale = locale
    if (includeDrafts) params.status = 'draft'
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
  const { data, pending, error, refresh } = useAsyncData<PaginatedResponse<T>>(
    key || `cms-collection-${collection}`,
    () => $fetch(`/api/cms/collections/${collection}`, {
      params: queryParams.value
    }),
    {
      lazy,
      watch: options.watch ? [queryParams] : undefined
    }
  )

  // Computed values
  const items = computed(() => (data.value?.data as T[]) || [])
  const meta = computed(() => data.value?.meta)
  const total = computed(() => meta.value?.total || 0)
  const page = computed(() => meta.value?.page || 1)
  const totalPages = computed(() => meta.value?.totalPages || 0)

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
