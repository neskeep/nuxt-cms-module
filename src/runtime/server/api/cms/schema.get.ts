import { defineEventHandler, useRuntimeConfig } from '#imports'
import { requireAuth } from '../../utils/auth'

export default defineEventHandler(async (event) => {
  // Require authentication
  await requireAuth(event)

  const config = useRuntimeConfig()
  const cmsConfig = config.cms.config

  return {
    locales: cmsConfig?.locales || ['en'],
    defaultLocale: cmsConfig?.defaultLocale || 'en',
    adminPath: config.public.cms.adminPath,
    collections: cmsConfig?.collections || {},
    singletons: cmsConfig?.singletons || {}
  }
})
