'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { partCreateSchema, type PartCreate } from '@/core/schemas/part'
import { db } from '@/lib/dexie/db'
import { enqueue } from '@/lib/sync/outbox'
import { toast } from 'sonner'
import { v4 as uuid } from 'uuid'

interface Props {
  open: boolean
  onOpenChange(open: boolean): void
}

export function NewPartDialog({ open, onOpenChange }: Props) {
  const form = useForm<PartCreate>({
    resolver: zodResolver(partCreateSchema),
    defaultValues: { id: uuid(), name: '', sku: '' },
  })

  async function onSubmit(data: PartCreate) {
    try {
      const now = new Date().toISOString()
      await db.parts.put({
        ...data,
        tech_id: '',
        created_at: now,
        updated_at: now,
        deleted_at: undefined,
        sync_version: 0,
      })
      // Also init tech_inventory row with 0 qty
      await db.tech_inventory.put({
        tech_id: '',
        part_id: data.id,
        qty: 0,
        updated_at: now,
        sync_version: 0,
      })
      await enqueue('parts', 'insert', data.id, data)
      toast.success('Parte agregada')
      form.reset({ id: uuid(), name: '', sku: '' })
      onOpenChange(false)
    } catch {
      toast.error('No se pudo guardar la parte')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Nueva Parte</DialogTitle>
          <DialogDescription>Agregá una parte al inventario técnico.</DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="part-name">Nombre</Label>
            <Input id="part-name" placeholder="Ej: Filtro deshidratador 1/2" {...form.register('name')} />
            {form.formState.errors.name && (
              <p className="text-destructive text-xs">{form.formState.errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="part-sku">SKU / Código (opcional)</Label>
            <Input id="part-sku" placeholder="Ej: FLT-0512" {...form.register('sku')} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="outline" className="flex-1 touch-target" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 touch-target" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
              Guardar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
