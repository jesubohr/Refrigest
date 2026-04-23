'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/dexie/db'
import { MapPin, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useServiceDraft } from '@/hooks/useServiceDraft'
import { NewBranchDialog } from '../../branches/NewBranchDialog'

export function BranchStep() {
  const { clientWa, setBranch, setStep } = useServiceDraft()
  const [newBranchOpen, setNewBranchOpen] = useState(false)

  const branches = useLiveQuery(
    async () => {
      if (!clientWa) return []
      return db.branches
        .where({ client_wa: clientWa })
        .filter((b) => !b.deleted_at)
        .sortBy('name')
    },
    [clientWa]
  )

  function selectBranch(id: string) {
    setBranch(id)
    setStep(2)
  }

  if (!clientWa) return null

  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-1 text-balance text-base font-semibold">¿En qué sucursal?</h2>
        <p className="text-pretty text-sm text-muted-foreground">
          Seleccioná la sucursal donde se realizará el servicio.
        </p>
      </div>

      <div className="space-y-2">
        {branches?.map((branch) => (
          <button key={branch.id} onClick={() => selectBranch(branch.id)} className="w-full text-left">
            <Card className="cursor-pointer transition-colors hover:bg-muted/30">
              <CardContent className="flex items-center gap-3 py-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-green-500/10 text-green-600">
                  <MapPin className="size-4" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{branch.name}</p>
                  {branch.address && (
                    <p className="truncate text-xs text-muted-foreground">{branch.address}</p>
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
        onClick={() => setNewBranchOpen(true)}
      >
        <Plus className="mr-2 size-4" aria-hidden />
        Nueva Sucursal
      </Button>

      <NewBranchDialog
        open={newBranchOpen}
        onOpenChange={setNewBranchOpen}
        clientWa={clientWa}
      />
    </div>
  )
}
