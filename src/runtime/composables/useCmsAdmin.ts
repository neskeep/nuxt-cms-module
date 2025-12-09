import { ref, computed } from 'vue'
import { useState, useFetch, navigateTo, useRuntimeConfig } from '#imports'
import type { SafeCmsUser } from '../types'

/**
 * Composable for CMS admin functionality
 */
export function useCmsAdmin() {
  const config = useRuntimeConfig()

  // Auth state
  const user = useState<SafeCmsUser | null>('cms-user', () => null)
  const isAuthenticated = computed(() => !!user.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  // Loading states
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Check authentication status
   */
  async function checkAuth(): Promise<boolean> {
    try {
      const response = await $fetch<{ user: SafeCmsUser }>('/api/cms/auth/me')
      user.value = response.user
      return true
    } catch {
      user.value = null
      return false
    }
  }

  /**
   * Login to admin panel
   */
  async function login(username: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await $fetch<{ success: boolean; user: SafeCmsUser }>('/api/cms/auth/login', {
        method: 'POST',
        body: { username, password }
      })

      if (response.success) {
        user.value = response.user
        return true
      }

      error.value = 'Invalid credentials'
      return false
    } catch (err: any) {
      error.value = err.data?.statusMessage || 'Login failed'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Logout from admin panel
   */
  async function logout(): Promise<void> {
    try {
      await $fetch('/api/cms/auth/logout', { method: 'POST' })
    } finally {
      user.value = null
      await navigateTo(`${config.public.cms.adminPath}/login`)
    }
  }

  /**
   * Get CMS schema (collections and singletons)
   */
  async function getSchema() {
    return $fetch('/api/cms/schema')
  }

  /**
   * Navigate to admin page
   */
  function goTo(path: string) {
    const base = config.public.cms.adminPath
    const fullPath = path.startsWith('/') ? `${base}${path}` : `${base}/${path}`
    return navigateTo(fullPath)
  }

  return {
    // State
    user,
    isAuthenticated,
    isAdmin,
    loading,
    error,

    // Actions
    checkAuth,
    login,
    logout,
    getSchema,
    goTo
  }
}
