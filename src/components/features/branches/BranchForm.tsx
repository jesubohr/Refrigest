'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, MapPin, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { branchCreateSchema, type BranchCreate } from '@/core/schemas/branch'
import { useGeo } from '@/hooks/useGeo'
import { db } from '@/lib/dexie/db'
import { enqueue } from '@/lib/sync/outbox'
import { toast } from 'sonner'
import { v4 as uuid } from 'uuid'

interface BranchFormProps {
  clientWa: string
  onSuccess(id: string): void
  onCancel(): void
}

export function BranchForm({ clientWa, onSuccess, onCancel }: BranchFormProps) {
  const geo = useGeo()
  const form = useForm<BranchCreate>({
    resolver: zodResolver(branchCreateSchema),
    defaultValues: { id: uuid(), client_wa: clientWa, name: '' },
  })

  async function captureGPS() {
    geo.capture()
    // Watch for coords update
    const interval = setInterval(() => {
      if (geo.coords) {
        form.setValue('lat', geo.coords.lat)
        form.setValue('lng', geo.coords.lng)
        clearInterval(interval)
      }
    }, 200)
  }

  async function onSubmit(data: BranchCreate) {
    try {
      const now = new Date().toISOString()
      await db.branches.put({
        ...data,
        tech_id: '',
        created_at: now,
        updated_at: now,
        deleted_at: undefined,
        sync_version: 0,
      })
      await enqueue('branches', 'insert', data.id, data)
      toast.success('Sucursal guardada')
      onSuccess(data.id)
    } catch {
      toast.error('No se pudo guardar la sucursal')
    }
  }

  const coords = geo.coords

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="branch-name">Nombre de Sucursal</Label>
        <Input id="branch-name" placeholder="Ej: Local Centro" {...form.register('name')} />
        {form.formState.errors.name && (
          <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="branch-address">Dirección (opcional)</Label>
        <Input id="branch-address" placeholder="Av. Colón 1234" {...form.register('address')} />
      </div>

      {/* GPS capture */}
      <div className="space-y-1.5">
        <Label>Ubicación GPS</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="touch-target flex-1"
            onClick={captureGPS}
            disabled={geo.loading}
          >
            {geo.loading ? (
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            ) : (
              <Navigation className="mr-2 size-4" aria-hidden />
            )}
            Capturar GPS
          </Button>
          {coords && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <MapPin className="size-3.5" aria-hidden />
              <span className="tabular">{coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}</span>
            </div>
          )}
        </div>
        {geo.error && <p className="text-destructive text-xs">{geo.error}</p>}
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
