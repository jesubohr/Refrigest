import { db } from './db'
import type { MediaBlob } from './schema'
import type { MediaKind } from '@/core/types'

/** Compress an image Blob using canvas (quality 0.7, max 1600px) */
export async function compressImage(blob: Blob, maxPx = 1600, quality = 0.7): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()

    img.onload = () => {
      URL.revokeObjectURL(url)

      const { width, height } = img
      const scale = Math.min(1, maxPx / Math.max(width, height))
      const canvas = document.createElement('canvas')
      canvas.width = Math.round(width * scale)
      canvas.height = Math.round(height * scale)

      const ctx = canvas.getContext('2d')
      if (!ctx) {
        reject(new Error('Canvas 2D not supported'))
        return
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      canvas.toBlob(
        (compressed) => {
          if (!compressed) {
            reject(new Error('Canvas toBlob returned null'))
            return
          }
          resolve(compressed)
        },
        'image/jpeg',
        quality
      )
    }

    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('Failed to load image'))
    }

    img.src = url
  })
}

/** Save a media blob locally (compressed if image) */
export async function saveMediaBlob(params: {
  id: string
  service_id: string
  kind: MediaKind
  blob: Blob
  mimeType: string
}): Promise<void> {
  const { id, service_id, kind, blob, mimeType } = params

  const finalBlob =
    mimeType.startsWith('image/') ? await compressImage(blob) : blob

  const entry: MediaBlob = {
    id,
    service_id,
    kind,
    blob: finalBlob,
    mime_type: mimeType,
    size_bytes: finalBlob.size,
    uploaded: false,
    remote_url: null,
    created_at: new Date().toISOString(),
  }

  await db.media_blobs.put(entry)
}

/** Get a local blob URL for preview */
export function getBlobUrl(blob: Blob): string {
  return URL.createObjectURL(blob)
}

/** Mark a media blob as uploaded and store its remote URL */
export async function markBlobUploaded(id: string, remoteUrl: string): Promise<void> {
  await db.media_blobs.update(id, { uploaded: true, remote_url: remoteUrl })
}

/** Get all pending (not yet uploaded) blobs for a service */
export async function getPendingBlobs(service_id: string): Promise<MediaBlob[]> {
  return db.media_blobs.where({ service_id, uploaded: false }).toArray()
}
