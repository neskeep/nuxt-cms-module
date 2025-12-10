import { computed } from 'vue'
import { useAsyncData } from '#imports'

export interface UseCmsSingletonOptions {
  /** Locale for translations */
  locale?: string
  /** Unique key for caching */
  key?: string
  /** Lazy load (don't fetch immediately) */
  lazy?: boolean
  /** Use authenticated API (for admin) instead of public API */
  authenticated?: boolean
}

/**
 * Composable for fetching singleton data
 */
export function useCmsSingleton<T = Record<string, unknown>>(
  name: string,
  options: UseCmsSingletonOptions = {}
) {
  const { locale, key, lazy = false, authenticated = false } = options

  // Determine API endpoint (public vs authenticated)
  const apiBase = authenticated ? '/api/cms/singletons' : '/api/cms/public/singletons'

  // Fetch singleton data
  const { data: rawData, pending, error, refresh } = useAsyncData(
    key || `cms-singleton-${name}-${authenticated ? 'auth' : 'public'}`,
    () => $fetch(`${apiBase}/${name}`, {
      params: locale ? { locale } : undefined
    }),
    {
      lazy
    }
  )

  // Computed values
  const data = computed<T | null>(() => {
    if (!rawData.value) return null
    return rawData.value.data as T
  })

  const id = computed(() => rawData.value?.id || null)

  const translations = computed(() => rawData.value?.translations || {})

  /**
   * Get translated field value
   */
  function getTranslation(field: string, targetLocale: string): unknown {
    const trans = translations.value[targetLocale]
    if (trans && field in trans) {
      return trans[field]
    }
    // Fallback to default data
    return data.value ? (data.value as Record<string, unknown>)[field] : undefined
  }

  /**
   * Update singleton data
   */
  async function update(updateData: Partial<T>, updateTranslations?: Record<string, Partial<T>>) {
    return $fetch(`/api/cms/singletons/${name}`, {
      method: 'PUT',
      body: {
        data: updateData,
        translations: updateTranslations
      }
    })
  }

  return {
    // Data
    data,
    id,
    translations,
    rawData,

    // State
    pending,
    error,

    // Actions
    refresh,
    update,
    getTranslation
  }
}
