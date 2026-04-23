'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/dexie/db'
import { AlertTriangle, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ClaimForm } from './ClaimForm'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Props {
  warrantyId: string
}

export function ClaimList({ warrantyId }: Props) {
  const [showForm, setShowForm] = useState(false)

  const claims = useLiveQuery(
    () => db.claims.where({ warranty_id: warrantyId }).reverse().sortBy('date'),
    [warrantyId]
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Reclamos</span>
        {!showForm && (
          <Button
            size="sm"
            variant="outline"
            className="touch-target"
            onClick={() => setShowForm(true)}
          >
            <Plus className="mr-1.5 size-3.5" aria-hidden />
            Nuevo
          </Button>
        )}
      </div>

      {showForm && (
        <>
          <ClaimForm warrantyId={warrantyId} onSuccess={() => setShowForm(false)} />
          <Separator />
        </>
      )}

      {claims === undefined ? null : claims.length === 0 ? (
        <div className="flex flex-col items-center gap-2 py-6 text-center text-muted-foreground">
          <AlertTriangle className="size-7 opacity-40" aria-hidden />
          <p className="text-pretty text-sm">Sin reclamos registrados.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {claims.map((claim) => (
            <div key={claim.id} className="space-y-1">
              <p className="text-xs text-muted-foreground">
                {format(new Date(claim.date), "d 'de' MMMM yyyy", { locale: es })}
              </p>
              {claim.notes && (
                <p className="text-sm text-pretty">{claim.notes}</p>
              )}
              <Separator />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
