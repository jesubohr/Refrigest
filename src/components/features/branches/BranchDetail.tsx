'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/dexie/db'
import { Thermometer, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EquipmentCard } from '../equipment/EquipmentCard'
import { NewEquipmentDialog } from '../equipment/NewEquipmentDialog'

interface Props {
  branchId: string
  wa: string
}

export function BranchDetail({ branchId, wa }: Props) {
  const [open, setOpen] = useState(false)

  const branch = useLiveQuery(() => db.branches.get(branchId), [branchId])
  const equipmentList = useLiveQuery(
    () => db.equipment.where({ branch_id: branchId }).filter((e) => !e.deleted_at).sortBy('brand'),
    [branchId]
  )

  if (!branch) return null

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-balance text-base">{branch.name}</CardTitle>
        </CardHeader>
        {(branch.address || branch.lat) && (
          <CardContent className="text-sm text-muted-foreground">
            {branch.address && <p>{branch.address}</p>}
            {branch.lat && branch.lng && (
              <p className="tabular text-xs">{branch.lat.toFixed(5)}, {branch.lng.toFixed(5)}</p>
            )}
          </CardContent>
        )}
      </Card>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-balance text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Equipos
          </h2>
          <Button size="sm" variant="outline" onClick={() => setOpen(true)} className="touch-target">
            <Plus className="mr-1.5 size-3.5" aria-hidden />
            Agregar
          </Button>
        </div>

        {equipmentList === undefined ? null : equipmentList.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-10 text-center text-muted-foreground">
            <Thermometer className="size-8 opacity-40" aria-hidden />
            <p className="text-pretty text-sm">No hay equipos en esta sucursal.</p>
            <Button size="sm" onClick={() => setOpen(true)} className="touch-target">
              <Plus className="mr-1.5 size-3.5" aria-hidden />
              Agregar Equipo
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {equipmentList.map((eq) => (
              <EquipmentCard key={eq.id} equipment={eq} wa={wa} />
            ))}
          </div>
        )}
      </div>

      <NewEquipmentDialog open={open} onOpenChange={setOpen} branchId={branchId} />
    </div>
  )
}
