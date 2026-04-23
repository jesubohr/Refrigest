'use client'

import { useRef } from 'react'
import { Camera, Trash2, ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useServiceDraft } from '@/hooks/useServiceDraft'
import { saveMediaBlob } from '@/lib/dexie/media'
import { v4 as uuid } from 'uuid'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { db } from '@/lib/dexie/db'
import type { MediaBlob } from '@/lib/dexie/schema'

type PhotoSide = 'photo_before' | 'photo_after'

export function PhotoStep() {
  const { serviceId, photoIds, addPhotoId, removePhotoId, setStep } = useServiceDraft()
  const beforeRef = useRef<HTMLInputElement>(null)
  const afterRef = useRef<HTMLInputElement>(null)
  const [blobs, setBlobs] = useState<MediaBlob[]>([])

  // Load blobs from Dexie for preview
  useEffect(() => {
    if (photoIds.length === 0) {
      setBlobs([])
      return
    }
    db.media_blobs.where('id').anyOf(photoIds).toArray().then(setBlobs)
  }, [photoIds])

  async function handlePhoto(e: React.ChangeEvent<HTMLInputElement>, kind: PhotoSide) {
    const file = e.target.files?.[0]
    if (!file || !serviceId) return

    const id = uuid()
    await saveMediaBlob({
      id,
      service_id: serviceId,
      kind,
      blob: file,
      mimeType: file.type || 'image/jpeg',
    })
    addPhotoId(id)
    e.target.value = '' // reset input
  }

  const beforeBlobs = blobs.filter((b) => b.kind === 'photo_before')
  const afterBlobs = blobs.filter((b) => b.kind === 'photo_after')

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-balance text-base font-semibold">Fotos</h2>
        <p className="text-pretty text-sm text-muted-foreground">
          Capturá fotos antes y después del servicio.
        </p>
      </div>

      {/* Before photos */}
      <PhotoSection
        label="Antes"
        blobs={beforeBlobs}
        inputRef={beforeRef}
        kind="photo_before"
        onCapture={beforeRef}
        onChange={(e) => handlePhoto(e, 'photo_before')}
        onRemove={(id) => removePhotoId(id)}
      />

      {/* After photos */}
      <PhotoSection
        label="Después"
        blobs={afterBlobs}
        inputRef={afterRef}
        kind="photo_after"
        onCapture={afterRef}
        onChange={(e) => handlePhoto(e, 'photo_after')}
        onRemove={(id) => removePhotoId(id)}
      />

      <Button className="w-full touch-target" onClick={() => setStep(5)}>
        Continuar
      </Button>
    </div>
  )
}

function PhotoSection({
  label,
  blobs,
  inputRef,
  kind,
  onChange,
  onRemove,
}: {
  label: string
  blobs: MediaBlob[]
  inputRef: React.RefObject<HTMLInputElement | null>
  kind: PhotoSide
  onCapture: React.RefObject<HTMLInputElement | null>
  onChange(e: React.ChangeEvent<HTMLInputElement>): void
  onRemove(id: string): void
}) {
  const [previewUrls, setPreviewUrls] = useState<Map<string, string>>(new Map())

  useEffect(() => {
    const urls = new Map<string, string>()
    blobs.forEach((b) => {
      if (b.blob) urls.set(b.id, URL.createObjectURL(b.blob))
    })
    setPreviewUrls(urls)

    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [blobs])

  return (
    <div className="space-y-2">
      <span className="text-sm font-medium">{label}</span>

      {blobs.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {blobs.map((blob) => {
            const url = previewUrls.get(blob.id)
            return (
              <div key={blob.id} className="group relative aspect-square overflow-hidden rounded-lg border">
                {url && (
                  <Image src={url} alt={`Foto ${label}`} fill className="object-cover" />
                )}
                <button
                  onClick={() => onRemove(blob.id)}
                  className="absolute right-1 top-1 flex size-6 items-center justify-center rounded-full bg-destructive text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Eliminar foto"
                >
                  <Trash2 className="size-3" aria-hidden />
                </button>
              </div>
            )
          })}
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onChange}
      />

      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full touch-target"
        onClick={() => inputRef.current?.click()}
      >
        <Camera className="mr-2 size-4" aria-hidden />
        {blobs.length === 0 ? `Capturar foto (${label})` : `Agregar otra foto`}
      </Button>
    </div>
  )
}
