'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { clientCreateSchema, type ClientCreate } from '@/core/schemas/client'
import { db } from '@/lib/dexie/db'
import { enqueue } from '@/lib/sync/outbox'
import { toast } from 'sonner'

interface ClientFormProps {
  onSuccess(wa: string): void
  onCancel(): void
}

export function ClientForm({ onSuccess, onCancel }: ClientFormProps) {
  const form = useForm<ClientCreate>({
    resolver: zodResolver(clientCreateSchema),
    defaultValues: { whatsapp_e164: '', alias: '', legal_name: '' },
  })

  async function onSubmit(data: ClientCreate) {
    try {
      // Dexie-first: write locally, enqueue for sync
      await db.clients.put({
        ...data,
        tech_id: '', // filled from auth session at sync time
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        deleted_at: undefined,
        sync_version: 0,
      })

      await enqueue('clients', 'insert', data.whatsapp_e164, data)
      toast.success('Cliente guardado')
      onSuccess(data.whatsapp_e164)
    } catch (err) {
      toast.error('No se pudo guardar el cliente')
      console.error(err)
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {/* WhatsApp */}
      <div className="space-y-1.5">
        <Label htmlFor="wa">WhatsApp (E.164)</Label>
        <Input
          id="wa"
          type="tel"
          placeholder="+5491123456789"
          autoComplete="tel"
          {...form.register('whatsapp_e164')}
        />
        {form.formState.errors.whatsapp_e164 && (
          <p className="text-destructive text-xs">{form.formState.errors.whatsapp_e164.message}</p>
        )}
      </div>

      {/* Alias */}
      <div className="space-y-1.5">
        <Label htmlFor="alias">Nombre / Alias</Label>
        <Input id="alias" placeholder="Ej: Supermercado Norte" {...form.register('alias')} />
        {form.formState.errors.alias && (
          <p className="text-destructive text-xs">{form.formState.errors.alias.message}</p>
        )}
      </div>

      {/* Legal name */}
      <div className="space-y-1.5">
        <Label htmlFor="legal_name">Razón Social (opcional)</Label>
        <Input id="legal_name" placeholder="Ej: Norte S.A." {...form.register('legal_name')} />
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
