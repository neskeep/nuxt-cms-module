import { ref, computed } from 'vue'
import { useAsyncData } from '#imports'
import type { MediaItem, MediaQueryOptions, PaginatedResponse } from '../types'

export interface UseCmsMediaOptions extends MediaQueryOptions {
  /** Unique key for caching */
  key?: string
  /** Lazy load (don't fetch immediately) */
  lazy?: boolean
}

/**
 * Composable for managing media library
 */
export function useCmsMedia(options: UseCmsMediaOptions = {}) {
  const {
    type,
    search,
    limit = 20,
    offset = 0,
    orderBy = 'createdAt',
    orderDir = 'desc',
    key,
    lazy = false
  } = options

  // Build query params
  const queryParams = computed(() => {
    const params: Record<string, string | number> = {
      perPage: limit,
      page: Math.floor(offset / limit) + 1,
      orderBy,
      orderDir
    }

    if (type) params.type = type
    if (search) params.search = search

    return params
  })

  // Fetch media
  const { data, pending, error, refresh } = useAsyncData<PaginatedResponse<MediaItem>>(
    key || 'cms-media',
    () => $fetch('/api/cms/media', {
      params: queryParams.value
    }),
    {
      lazy
    }
  )

  // Computed values
  const items = computed(() => data.value?.data || [])
  const meta = computed(() => data.value?.meta)
  const total = computed(() => meta.value?.total || 0)

  // Upload state
  const uploading = ref(false)
  const uploadProgress = ref(0)
  const uploadError = ref<string | null>(null)

  /**
   * Upload a file
   */
  async function upload(file: File, alt?: string): Promise<MediaItem | null> {
    uploading.value = true
    uploadProgress.value = 0
    uploadError.value = null

    try {
      const formData = new FormData()
      formData.append('file', file)
      if (alt) {
        formData.append('alt', alt)
      }

      const result = await $fetch<MediaItem>('/api/cms/media/upload', {
        method: 'POST',
        body: formData
      })

      uploadProgress.value = 100

      // Refresh media list
      await refresh()

      return result
    } catch (err: any) {
      uploadError.value = err.message || 'Upload failed'
      return null
    } finally {
      uploading.value = false
    }
  }

  /**
   * Upload multiple files
   */
  async function uploadMultiple(files: File[], altTexts?: Record<string, string>): Promise<MediaItem[]> {
    const results: MediaItem[] = []

    for (const file of files) {
      const alt = altTexts?.[file.name]
      const result = await upload(file, alt)
      if (result) {
        results.push(result)
      }
    }

    return results
  }

  /**
   * Delete a media item
   */
  async function remove(id: string): Promise<boolean> {
    try {
      await $fetch(`/api/cms/media/${id}`, {
        method: 'DELETE'
      })

      // Refresh media list
      await refresh()

      return true
    } catch {
      return false
    }
  }

  /**
   * Get media URL
   */
  function getUrl(media: MediaItem | string): string {
    if (typeof media === 'string') {
      return `/api/cms/media/file/${media}`
    }
    return media.url || `/api/cms/media/file/${media.filename}`
  }

  /**
   * Check if media is an image
   */
  function isImage(media: MediaItem): boolean {
    return media.mimeType.startsWith('image/')
  }

  /**
   * Check if media is a video
   */
  function isVideo(media: MediaItem): boolean {
    return media.mimeType.startsWith('video/')
  }

  /**
   * Format file size for display
   */
  function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
  }

  return {
    // Data
    data,
    items,
    meta,
    total,

    // State
    pending,
    error,
    uploading,
    uploadProgress,
    uploadError,

    // Actions
    refresh,
    upload,
    uploadMultiple,
    remove,

    // Helpers
    getUrl,
    isImage,
    isVideo,
    formatSize
  }
}
