import { defineEventHandler } from '#imports'
import { requireAuth } from '../../../utils/auth'

export default defineEventHandler(async (event) => {
  await requireAuth(event)

  // TODO: Return list of singletons from cms.config
  return {
    singletons: []
  }
})
