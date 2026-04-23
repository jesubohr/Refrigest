'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/dexie/db'
import { Thermometer, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { useServiceDraft } from '@/hooks/useServiceDraft'
import { NewEquipmentDialog } from '../../equipment/NewEquipmentDialog'

const TAG_LABELS: Record<string, string> = {
  critical: 'Crítico',
  preventive_pending: 'Prev. Pendiente',
  active_warranty: 'Garantía',
}

export function EquipmentStep() {
  const { branchId, setEquipment, setStep } = useServiceDraft()
  const [newEqOpen, setNewEqOpen] = useState(false)

  const equipmentList = useLiveQuery(
    async () => {
      if (!branchId) return []
      return db.equipment
        .where({ branch_id: branchId })
        .filter((e) => !e.deleted_at)
        .sortBy('brand')
    },
    [branchId]
  )

  function selectEquipment(id: string) {
    setEquipment(id)
    setStep(3)
  }

  if (!branchId) return null

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-1 text-balance text-base font-semibold">¿Qué equipo?</h2>
        <p className="text-pretty text-sm text-muted-foreground">
          Seleccioná el equipo a intervenir.
        </p>
      </div>

      <div className="space-y-2">
        {equipmentList?.map((eq) => (
          <button key={eq.id} onClick={() => selectEquipment(eq.id)} className="w-full text-left">
            <Card className="cursor-pointer transition-colors hover:bg-muted/30">
              <CardContent className="flex items-center gap-3 py-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
                  <Thermometer className="size-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {eq.brand} {eq.model ?? ''}
                  </p>
                  {eq.refrigerant && (
                    <p className="text-xs text-muted-foreground">{eq.refrigerant}</p>
                  )}
                  {eq.tags.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1">
                      {eq.tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="py-0 text-xs">
                          {TAG_LABELS[tag] ?? tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <Button
        variant="outline"
        className="w-full touch-target"
        onClick={() => setNewEqOpen(true)}
      >
        <Plus className="mr-2 size-4" aria-hidden />
        Nuevo Equipo
      </Button>

      {branchId && (
        <NewEquipmentDialog
          open={newEqOpen}
          onOpenChange={setNewEqOpen}
          branchId={branchId}
        />
      )}
    </div>
  )
}
