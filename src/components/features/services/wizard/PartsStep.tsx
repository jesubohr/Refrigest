'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/dexie/db'
import { Plus, Minus, Search, Package } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useServiceDraft } from '@/hooks/useServiceDraft'
import { useRouter } from 'next/navigation'
import { db as dexieDb } from '@/lib/dexie/db'
import { enqueue } from '@/lib/sync/outbox'
import { toast } from 'sonner'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Checklist } from '@/core/schemas/service'

export function PartsStep() {
  const { parts, addPart, removePart, updatePartQty, serviceId, equipmentId, clientWa, branchId, checklist, notesText, voiceTranscript, photoIds, reset, setStep } = useServiceDraft()
  const [search, setSearch] = useState('')
  const router = useRouter()

  const allParts = useLiveQuery(
    () =>
      db.parts
        .filter(
          (p) =>
            !p.deleted_at &&
            (search === '' || p.name.toLowerCase().includes(search.toLowerCase()))
        )
        .sortBy('name'),
    [search]
  )

  const inventory = useLiveQuery(() => db.tech_inventory.toArray(), [])
  const stockMap = new Map(inventory?.map((i) => [i.part_id, i.qty]) ?? [])

  function getPartQty(partId: string): number {
    return parts.find((p) => p.part_id === partId)?.qty ?? 0
  }

  function addOrIncrement(partId: string) {
    const existing = parts.find((p) => p.part_id === partId)
    if (existing) {
      updatePartQty(partId, existing.qty + 1)
    } else {
      addPart({ service_id: serviceId ?? '', part_id: partId, qty: 1 })
    }
  }

  function decrement(partId: string) {
    const existing = parts.find((p) => p.part_id === partId)
    if (!existing) return
    if (existing.qty <= 1) {
      removePart(partId)
    } else {
      updatePartQty(partId, existing.qty - 1)
    }
  }

  async function finalize() {
    if (!serviceId || !equipmentId) {
      toast.error('Faltan datos del servicio')
      return
    }

    try {
      const now = new Date().toISOString()

      // Save finalized service to Dexie
      await dexieDb.services.put({
        id: serviceId,
        equipment_id: equipmentId,
        tech_id: '',
        started_at: now,
        ended_at: now,
        checklist_jsonb: (checklist ?? null) as Checklist | null,
        notes_text: notesText || voiceTranscript || null,
        voice_transcript: voiceTranscript || null,
        voice_pending: false,
        finalized: false, // will be finalized on /service/[id]/finalize
        created_at: now,
        updated_at: now,
        deleted_at: undefined,
        sync_version: 0,
      })

      // Save service parts
      for (const part of parts) {
        await dexieDb.service_parts.put({
          service_id: serviceId,
          part_id: part.part_id,
          qty: part.qty,
        })
      }

      await enqueue('services', 'insert', serviceId, { id: serviceId, equipment_id: equipmentId })

      router.push(`/service/${serviceId}/finalize`)
    } catch (err) {
      toast.error('No se pudo guardar el servicio')
      console.error(err)
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="mb-1 text-balance text-base font-semibold">Partes Utilizadas</h2>
        <p className="text-pretty text-sm text-muted-foreground">
          Agregá las partes usadas en este servicio.
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input
          placeholder="Buscar parte..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Parts selected */}
      {parts.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Seleccionadas
          </p>
          {parts.map((sp) => {
            const part = allParts?.find((p) => p.id === sp.part_id)
            return (
              <div key={sp.part_id} className="flex items-center gap-2 py-1">
                <span className="flex-1 text-sm">{part?.name ?? sp.part_id}</span>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={() => decrement(sp.part_id)}
                    aria-label="Quitar uno"
                  >
                    <Minus className="size-3" aria-hidden />
                  </Button>
                  <span className="w-6 text-center text-sm tabular font-medium">{sp.qty}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-7"
                    onClick={() => addOrIncrement(sp.part_id)}
                    aria-label="Agregar uno"
                  >
                    <Plus className="size-3" aria-hidden />
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Parts list */}
      <div className="space-y-2">
        {allParts?.length === 0 && (
          <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
            <Package className="size-8 opacity-40" aria-hidden />
            <p className="text-sm text-pretty">No hay partes en el inventario.</p>
            <Link href="/inventory" className={cn(buttonVariants({ variant: 'link', size: 'sm' }))}>
              Ir al inventario
            </Link>
          </div>
        )}
        {allParts?.filter((p) => !parts.some((sp) => sp.part_id === p.id)).map((part) => {
          const stock = stockMap.get(part.id) ?? 0
          return (
            <Card key={part.id}>
              <CardContent className="flex items-center gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{part.name}</p>
                  <p className="text-xs text-muted-foreground tabular">Stock: {stock}</p>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="touch-target shrink-0"
                  disabled={stock === 0}
                  onClick={() => addOrIncrement(part.id)}
                >
                  <Plus className="size-4" aria-hidden />
                </Button>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <Button className="w-full touch-target" onClick={finalize}>
        Ir a Finalizar Servicio →
      </Button>
    </div>
  )
}
