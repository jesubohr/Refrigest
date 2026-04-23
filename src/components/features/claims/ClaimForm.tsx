'use client'

import { useForm } from 'react-hook-form'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { db } from '@/lib/dexie/db'
import { enqueue } from '@/lib/sync/outbox'
import { toast } from 'sonner'
import { v4 as uuid } from 'uuid'

interface Props {
  warrantyId: string
  onSuccess(): void
}

interface FormData {
  notes: string
}

export function ClaimForm({ warrantyId, onSuccess }: Props) {
  const form = useForm<FormData>({
    defaultValues: { notes: '' },
  })

  async function onSubmit(data: FormData) {
    const now = new Date().toISOString()
    const id = uuid()

    try {
      await db.claims.put({
        id,
        warranty_id: warrantyId,
        tech_id: '',
        date: now,
        notes: data.notes.trim() || null,
        created_at: now,
        updated_at: now,
        sync_version: 0,
      })
      await enqueue('claims', 'insert', id, {
        id,
        warranty_id: warrantyId,
        date: now,
        notes: data.notes.trim() || null,
      })
      toast.success('Reclamo registrado')
      onSuccess()
    } catch {
      toast.error('No se pudo registrar el reclamo')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="claim-notes">Descripción del reclamo</Label>
        <Textarea
          id="claim-notes"
          placeholder="Describí el problema o reclamo del cliente..."
          rows={4}
          {...form.register('notes')}
        />
      </div>
      <Button type="submit" className="w-full touch-target" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting && (
          <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
        )}
        Registrar Reclamo
      </Button>
    </form>
  )
}
