'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/dexie/db'
import { Package, Plus, Minus, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { NewPartDialog } from './NewPartDialog'
import { exportInventoryCsv } from '@/lib/export'
import { enqueue } from '@/lib/sync/outbox'
import { toast } from 'sonner'

export function InventoryScreen() {
  const [open, setOpen] = useState(false)

  const partsWithStock = useLiveQuery(async () => {
    const parts = await db.parts.filter((p) => !p.deleted_at).sortBy('name')
    const inventory = await db.tech_inventory.toArray()
    const stockMap = new Map(inventory.map((i) => [i.part_id, i.qty]))

    return parts.map((p) => ({
      ...p,
      qty: stockMap.get(p.id) ?? 0,
    }))
  }, [])

  async function handleExport() {
    try {
      await exportInventoryCsv()
      toast.success('CSV exportado')
    } catch {
      toast.error('No se pudo exportar')
    }
  }

  async function adjustStock(partId: string, delta: number, currentQty: number) {
    const newQty = Math.max(0, currentQty + delta)
    const now = new Date().toISOString()
    try {
      const existing = await db.tech_inventory.get(partId)
      if (existing) {
        await db.tech_inventory.update(partId, { qty: newQty, updated_at: now })
      } else {
        await db.tech_inventory.put({ part_id: partId, tech_id: '', qty: newQty, updated_at: now, sync_version: 0 })
      }
      await enqueue('tech_inventory', 'update', partId, { part_id: partId, qty: newQty })
    } catch {
      toast.error('No se pudo actualizar el stock')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={() => setOpen(true)} size="sm" className="touch-target flex-1">
          <Plus className="mr-1.5 size-4" aria-hidden />
          Agregar Parte
        </Button>
        <Button variant="outline" size="sm" className="touch-target" onClick={handleExport}>
          <Download className="mr-1.5 size-4" aria-hidden />
          Exportar CSV
        </Button>
      </div>

      {partsWithStock === undefined ? null : partsWithStock.length === 0 ? (
        <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
          <Package className="size-10 opacity-40" aria-hidden />
          <p className="text-pretty text-sm">No hay partes en el inventario.</p>
          <Button size="sm" onClick={() => setOpen(true)} className="touch-target">
            <Plus className="mr-1.5 size-4" aria-hidden />
            Agregar Parte
          </Button>
        </div>
      ) : (
        <Card>
          <div className="divide-y">
            {partsWithStock.map((part, i) => (
              <div key={part.id}>
                <CardContent className="flex items-center gap-3 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{part.name}</p>
                    {part.sku && (
                      <p className="text-xs text-muted-foreground">{part.sku}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() => adjustStock(part.id, -1, part.qty)}
                      disabled={part.qty === 0}
                      aria-label="Quitar una unidad"
                    >
                      <Minus className="size-3" aria-hidden />
                    </Button>
                    <span className="w-8 text-center tabular text-sm font-semibold">{part.qty}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="size-7"
                      onClick={() => adjustStock(part.id, +1, part.qty)}
                      aria-label="Agregar una unidad"
                    >
                      <Plus className="size-3" aria-hidden />
                    </Button>
                    <StockBadge qty={part.qty} />
                  </div>
                </CardContent>
              </div>
            ))}
          </div>
        </Card>
      )}

      <NewPartDialog open={open} onOpenChange={setOpen} />
    </div>
  )
}

function StockBadge({ qty }: { qty: number }) {
  if (qty === 0) return <Badge variant="destructive" className="py-0 text-xs">Sin stock</Badge>
  if (qty <= 2) return <Badge variant="secondary" className="py-0 text-xs">Bajo</Badge>
  return <Badge variant="default" className="py-0 text-xs">OK</Badge>
}
