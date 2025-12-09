import { defineEventHandler, useRuntimeConfig } from '#imports'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  const config = useRuntimeConfig()
  const cmsConfig = config.cms.config
  const singletons = cmsConfig?.singletons || {}

  // Return list of singletons with their configs
  return {
    singletons: Object.entries(singletons).map(([name, singletonConfig]) => ({
      name,
      ...singletonConfig
    }))
  }
})
