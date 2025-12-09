import { defineEventHandler, useRuntimeConfig } from '#imports'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const config = useRuntimeConfig()
  const cmsConfig = config.cms.config
  const collections = cmsConfig?.collections || {}

  // Return list of collections with their configs
  return {
    collections: Object.entries(collections).map(([name, collectionConfig]) => ({
      name,
      ...collectionConfig
    }))
  }
})
