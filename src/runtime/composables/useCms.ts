import { computed } from 'vue'
import { useRuntimeConfig } from '#imports'

/**
 * Main CMS composable for accessing configuration and utilities
 */
export function useCms() {
  const config = useRuntimeConfig()
  const publicConfig = config.public.cms

  /**
   * Admin panel path
   */
  const adminPath = computed(() => publicConfig.adminPath)

  /**
   * Whether admin panel is enabled
   */
  const adminEnabled = computed(() => publicConfig.adminEnabled)

  /**
   * Get admin URL for a specific page
   */
  function getAdminUrl(path: string = '') {
    const base = publicConfig.adminPath
    if (!path) return base
    return `${base}${path.startsWith('/') ? path : '/' + path}`
  }

  /**
   * Get collection admin URL
   */
  function getCollectionUrl(collection: string, id?: string) {
    if (id) {
      return getAdminUrl(`/collections/${collection}/${id}`)
    }
    return getAdminUrl(`/collections/${collection}`)
  }

  /**
   * Get singleton admin URL
   */
  function getSingletonUrl(singleton: string) {
    return getAdminUrl(`/singletons/${singleton}`)
  }

  return {
    adminPath,
    adminEnabled,
    getAdminUrl,
    getCollectionUrl,
    getSingletonUrl
  }
}
