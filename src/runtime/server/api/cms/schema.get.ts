import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)

  // TODO: Read cms.config.ts and return schema
  // For now, return empty config - this will be populated from the module
  const config = useRuntimeConfig()

  return {
    locales: ['es', 'en'],
    defaultLocale: 'es',
    adminPath: config.public.cms.adminPath,
    collections: {},
    singletons: {}
  }
})
