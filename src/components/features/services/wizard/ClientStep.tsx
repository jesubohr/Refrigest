'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/dexie/db'
import { Search, Plus, Phone } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useServiceDraft } from '@/hooks/useServiceDraft'
import { NewClientDialog } from '../../clients/NewClientDialog'
import { v4 as uuid } from 'uuid'
import { db as dexieDb } from '@/lib/dexie/db'

export function ClientStep() {
  const { setClient, setServiceId, setStep } = useServiceDraft()
  const [search, setSearch] = useState('')
  const [newClientOpen, setNewClientOpen] = useState(false)

  const clients = useLiveQuery(
    () =>
      db.clients
        .filter(
          (c) =>
            !c.deleted_at &&
            (search === '' ||
              c.alias.toLowerCase().includes(search.toLowerCase()) ||
              c.whatsapp_e164.includes(search))
        )
        .sortBy('alias'),
    [search]
  )

  async function selectClient(wa: string) {
    setClient(wa)
    const serviceId = uuid()
    setServiceId(serviceId)
    setStep(1)
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-1 text-balance text-base font-semibold">¿Para qué cliente?</h2>
        <p className="text-pretty text-sm text-muted-foreground">
          Seleccioná un cliente existente o creá uno nuevo.
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            placeholder="Buscar por nombre o WhatsApp..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Button variant="outline" size="sm" className="touch-target shrink-0" onClick={() => setNewClientOpen(true)}>
          <Plus className="size-4" aria-label="Nuevo cliente" />
        </Button>
      </div>

      <div className="space-y-2">
        {clients?.map((client) => (
          <button
            key={client.whatsapp_e164}
            onClick={() => selectClient(client.whatsapp_e164)}
            className="w-full text-left"
          >
            <Card className="cursor-pointer transition-colors hover:bg-muted/30">
              <CardContent className="flex items-center gap-3 py-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Phone className="size-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{client.alias}</p>
                  <p className="text-xs text-muted-foreground tabular">{client.whatsapp_e164}</p>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}

        {clients?.length === 0 && search && (
          <p className="text-center text-sm text-muted-foreground py-4">
            No se encontraron clientes.{' '}
            <button
              onClick={() => setNewClientOpen(true)}
              className="text-primary underline"
            >
              Crear nuevo
            </button>
          </p>
        )}
      </div>

      <NewClientDialog
        open={newClientOpen}
        onOpenChange={setNewClientOpen}
      />
    </div>
  )
}
