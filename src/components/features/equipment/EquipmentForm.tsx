'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Camera, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { equipmentCreateSchema, type EquipmentCreate } from '@/core/schemas/equipment'
import { db } from '@/lib/dexie/db'
import { enqueue } from '@/lib/sync/outbox'
import { toast } from 'sonner'
import { v4 as uuid } from 'uuid'
import Image from 'next/image'

const TAGS = [
  { value: 'critical', label: 'Crítico' },
  { value: 'preventive_pending', label: 'Preventivo Pendiente' },
  { value: 'active_warranty', label: 'Garantía Activa' },
] as const

interface Props {
  branchId: string
  onSuccess(id: string): void
  onCancel(): void
}

export function EquipmentForm({ branchId, onSuccess, onCancel }: Props) {
  const photoInputRef = useRef<HTMLInputElement>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)
  const [photoBlob, setPhotoBlob] = useState<Blob | null>(null)

  const form = useForm<EquipmentCreate>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(equipmentCreateSchema) as any,
    defaultValues: {
      id: uuid(),
      branch_id: branchId,
      brand: '',
      tags: [],
      placa_photo_pending: false,
    },
  })

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoBlob(file)
    setPhotoPreview(URL.createObjectURL(file))
    form.setValue('placa_photo_pending', true)
  }

  async function onSubmit(data: EquipmentCreate) {
    try {
      const now = new Date().toISOString()
      await db.equipment.put({
        ...data,
        tech_id: '',
        created_at: now,
        updated_at: now,
        deleted_at: undefined,
        sync_version: 0,
      })
      await enqueue('equipment', 'insert', data.id, data)
      toast.success('Equipo guardado')
      onSuccess(data.id)
    } catch {
      toast.error('No se pudo guardar el equipo')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="eq-brand">Marca</Label>
        <Input id="eq-brand" placeholder="Ej: Carrier, Trane, Copeland" {...form.register('brand')} />
        {form.formState.errors.brand && (
          <p className="text-destructive text-xs">{form.formState.errors.brand.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="eq-model">Modelo (opcional)</Label>
        <Input id="eq-model" placeholder="Ej: 38AUR018" {...form.register('model')} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="eq-refrigerant">Refrigerante (opcional)</Label>
        <Input id="eq-refrigerant" placeholder="Ej: R-410A" {...form.register('refrigerant')} />
      </div>

      {/* Placa photo */}
      <div className="space-y-1.5">
        <Label>Foto de Placa</Label>
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhoto}
        />
        {photoPreview ? (
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
            <Image src={photoPreview} alt="Placa del equipo" fill className="object-cover" />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              className="absolute bottom-2 right-2"
              onClick={() => photoInputRef.current?.click()}
            >
              Cambiar
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="w-full touch-target"
            onClick={() => photoInputRef.current?.click()}
          >
            <Camera className="mr-2 size-4" aria-hidden />
            Capturar Foto de Placa
          </Button>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Etiquetas</Label>
        {TAGS.map((tag) => (
          <div key={tag.value} className="flex items-center gap-2">
            <Checkbox
              id={`tag-${tag.value}`}
              onCheckedChange={(checked) => {
                const current = form.getValues('tags') ?? []
                form.setValue(
                  'tags',
                  checked
                    ? [...current, tag.value as 'critical' | 'preventive_pending' | 'active_warranty']
                    : current.filter((t) => t !== tag.value)
                )
              }}
            />
            <Label htmlFor={`tag-${tag.value}`} className="cursor-pointer font-normal">
              {tag.label}
            </Label>
          </div>
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="outline" className="flex-1 touch-target" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="flex-1 touch-target" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
          Guardar
        </Button>
      </div>
    </form>
  )
}
