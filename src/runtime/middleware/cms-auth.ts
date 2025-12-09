export default defineNuxtRouteMiddleware(async (to) => {
  const config = useRuntimeConfig()
  const adminPath = config.public.cms.adminPath
  const loginPath = `${adminPath}/login`

  // Skip middleware for login page
  if (to.path === loginPath) {
    return
  }

  // Check if user is authenticated
  const { checkAuth } = useCmsAdmin()
  const isAuthenticated = await checkAuth()

  if (!isAuthenticated) {
    return navigateTo(loginPath)
  }
})
