import { defineEventHandler, createError, setHeader, send, getRouterParam, useRuntimeConfig } from '#imports'
import { readFile } from 'fs/promises'
import { existsSync } from 'fs'
import { join } from 'path'

const mimeTypes: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.pdf': 'application/pdf',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm'
}

export default defineEventHandler(async (event) => {
  const filename = getRouterParam(event, 'filename')

  if (!filename) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Filename is required'
    })
  }

  const config = useRuntimeConfig()
  const uploadPath = config.cms.uploads.path
  const filePath = join(uploadPath, filename)

  // Security: Prevent directory traversal
  if (!filePath.startsWith(uploadPath) || filename.includes('..')) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid filename'
    })
  }

  if (!existsSync(filePath)) {
    throw createError({
      statusCode: 404,
      statusMessage: 'File not found'
    })
  }

  try {
    const fileBuffer = await readFile(filePath)

    // Determine content type from extension
    const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase()
    const contentType = mimeTypes[ext] || 'application/octet-stream'

    setHeader(event, 'Content-Type', contentType)
    setHeader(event, 'Cache-Control', 'public, max-age=31536000, immutable')

    return send(event, fileBuffer)
  } catch (error) {
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to read file'
    })
  }
})
