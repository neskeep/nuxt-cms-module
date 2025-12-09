/**
 * Media item stored in database
 */
export interface MediaItem {
  /** Unique identifier */
  id: string
  /** Stored filename */
  filename: string
  /** Original upload filename */
  originalName: string
  /** MIME type */
  mimeType: string
  /** File size in bytes */
  size: number
  /** Relative path in storage */
  path: string
  /** Public URL */
  url: string | null
  /** Image width (for images) */
  width: number | null
  /** Image height (for images) */
  height: number | null
  /** Alt text */
  alt: string | null
  /** Additional metadata */
  metadata: Record<string, unknown> | null
  /** Creation timestamp */
  createdAt: Date
  /** Creator user ID */
  createdBy: string | null
}

/**
 * Input for uploading media
 */
export interface UploadMediaInput {
  /** File data */
  file: File | Buffer
  /** Original filename */
  filename: string
  /** MIME type */
  mimeType: string
  /** Alt text */
  alt?: string
  /** Additional metadata */
  metadata?: Record<string, unknown>
}

/**
 * Media upload configuration
 */
export interface MediaUploadConfig {
  /** Upload directory path */
  path: string
  /** Maximum file size in bytes */
  maxSize: number
  /** Allowed MIME types */
  allowedTypes: string[]
}

/**
 * Query options for media
 */
export interface MediaQueryOptions {
  /** Filter by MIME type prefix (e.g., 'image/') */
  type?: string
  /** Search in filename or alt */
  search?: string
  /** Number of items to return */
  limit?: number
  /** Number of items to skip */
  offset?: number
  /** Sort by field */
  orderBy?: 'createdAt' | 'filename' | 'size'
  /** Sort direction */
  orderDir?: 'asc' | 'desc'
}

/**
 * Check if MIME type is an image
 */
export function isImageMimeType(mimeType: string): boolean {
  return mimeType.startsWith('image/')
}

/**
 * Check if MIME type is a video
 */
export function isVideoMimeType(mimeType: string): boolean {
  return mimeType.startsWith('video/')
}

/**
 * Check if MIME type is a document
 */
export function isDocumentMimeType(mimeType: string): boolean {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
  ]
  return documentTypes.includes(mimeType)
}

/**
 * Get file extension from filename
 */
export function getFileExtension(filename: string): string {
  const parts = filename.split('.')
  return parts.length > 1 ? parts.pop()!.toLowerCase() : ''
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}
