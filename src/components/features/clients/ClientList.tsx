'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/dexie/db'
import { Users, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ClientCard } from './ClientCard'
import { NewClientDialog } from './NewClientDialog'

export function ClientList() {
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)

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

  return (
    <div className="space-y-4">
      {/* Search + add */}
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
        <Button onClick={() => setOpen(true)} className="touch-target shrink-0">
          <Plus className="mr-1.5 size-4" aria-hidden />
          Agregar
        </Button>
      </div>

      {/* List */}
      {clients === undefined ? null : clients.length === 0 ? (
        <EmptyState onAdd={() => setOpen(true)} />
      ) : (
        <div className="space-y-2">
          {clients.map((client) => (
            <ClientCard key={client.whatsapp_e164} client={client} />
          ))}
        </div>
      )}

      <NewClientDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd(): void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center text-muted-foreground">
      <Users className="size-10 opacity-40" aria-hidden />
      <p className="text-pretty text-sm">No hay clientes aún.</p>
      <Button onClick={onAdd} size="sm" className="touch-target">
        <Plus className="mr-1.5 size-4" aria-hidden />
        Agregar Cliente
      </Button>
    </div>
  )
}
