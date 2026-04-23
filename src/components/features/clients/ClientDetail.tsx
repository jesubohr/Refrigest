'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/dexie/db'
import { MapPin, MessageCircle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BranchCard } from '../branches/BranchCard'
import { NewBranchDialog } from '../branches/NewBranchDialog'
import { openWhatsApp } from '@/lib/whatsapp'

interface Props {
  wa: string
}

export function ClientDetail({ wa }: Props) {
  const [open, setOpen] = useState(false)

  const client = useLiveQuery(() => db.clients.get(wa), [wa])
  const branches = useLiveQuery(
    () => db.branches.where({ client_wa: wa }).filter((b) => !b.deleted_at).sortBy('name'),
    [wa]
  )

  if (!client) return null

  return (
    <div className="space-y-4">
      {/* Client info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-balance text-base">{client.alias}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div>
            <p className="tabular text-muted-foreground">{client.whatsapp_e164}</p>
            {client.legal_name && <p className="mt-1 text-muted-foreground">{client.legal_name}</p>}
          </div>
          <Button
            variant="outline"
            size="sm"
            className="touch-target"
            onClick={() =>
              openWhatsApp({
                phoneE164: client.whatsapp_e164,
                message: `Hola ${client.alias},`,
              })
            }
          >
            <MessageCircle className="mr-1.5 size-3.5" aria-hidden />
            Abrir en WhatsApp
          </Button>
        </CardContent>
      </Card>

      {/* Branches */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-balance text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Sucursales
          </h2>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="touch-target">
            <Plus className="mr-1.5 size-3.5" aria-hidden />
            Agregar
          </Button>
        </div>

        {branches === undefined ? null : branches.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-10 text-center text-muted-foreground">
            <MapPin className="size-8 opacity-40" aria-hidden />
            <p className="text-pretty text-sm">No hay sucursales.</p>
            <Button size="sm" onClick={() => setOpen(true)} className="touch-target">
              <Plus className="mr-1.5 size-3.5" aria-hidden />
              Agregar Sucursal
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {branches.map((branch) => (
              <BranchCard key={branch.id} branch={branch} wa={wa} />
            ))}
          </div>
        )}
      </div>

      <NewBranchDialog open={open} onOpenChange={setOpen} clientWa={wa} />
    </div>
  )
}
