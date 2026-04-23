'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/dexie/db'
import { ShieldCheck, ShieldAlert, AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ClaimList } from '../claims/ClaimList'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export function WarrantyList() {
  const warranties = useLiveQuery(() => db.warranties.orderBy('expires_at').toArray(), [])

  const now = new Date()
  const soon = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000) // 30 days

  const active = warranties?.filter((w) => new Date(w.expires_at) > now) ?? []
  const expiringSoon = active.filter((w) => new Date(w.expires_at) <= soon)

  return (
    <Tabs defaultValue="active">
      <TabsList className="w-full">
        <TabsTrigger value="active" className="flex-1">
          Activas
          {active.length > 0 && (
            <Badge variant="secondary" className="ml-1.5 py-0 text-xs">
              {active.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="expiring" className="flex-1">
          Por Vencer
          {expiringSoon.length > 0 && (
            <Badge variant="destructive" className="ml-1.5 py-0 text-xs">
              {expiringSoon.length}
            </Badge>
          )}
        </TabsTrigger>
      </TabsList>

      <TabsContent value="active" className="mt-4">
        {active.length === 0 ? (
          <EmptyState message="No hay garantías activas." />
        ) : (
          <div className="space-y-2">
            {active.map((w) => (
              <WarrantyCard key={w.id} warranty={w} />
            ))}
          </div>
        )}
      </TabsContent>

      <TabsContent value="expiring" className="mt-4">
        {expiringSoon.length === 0 ? (
          <EmptyState message="No hay garantías por vencer en los próximos 30 días." />
        ) : (
          <div className="space-y-2">
            {expiringSoon.map((w) => (
              <WarrantyCard key={w.id} warranty={w} isExpiringSoon />
            ))}
          </div>
        )}
      </TabsContent>
    </Tabs>
  )
}

function WarrantyCard({
  warranty,
  isExpiringSoon,
}: {
  warranty: { id: string; duration_days: number; coverage: string; starts_at: string; expires_at: string }
  isExpiringSoon?: boolean
}) {
  const [claimsOpen, setClaimsOpen] = useState(false)
  const coverageLabel = warranty.coverage === 'full' ? 'Total' : 'Mano de Obra'

  return (
    <>
      <Card>
        <CardContent className="flex items-center gap-3 py-3">
          <div
            className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
              isExpiringSoon ? 'bg-destructive/10 text-destructive' : 'bg-green-500/10 text-green-600'
            }`}
          >
            {isExpiringSoon ? (
              <ShieldAlert className="size-4" aria-hidden />
            ) : (
              <ShieldCheck className="size-4" aria-hidden />
            )}
          </div>

          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium">
              {warranty.duration_days} días — {coverageLabel}
            </p>
            <p className="text-xs text-muted-foreground">
              Vence: {format(new Date(warranty.expires_at), "d MMM yyyy", { locale: es })}
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-1.5">
            {isExpiringSoon && (
              <Badge variant="destructive" className="text-xs">
                Próximo a vencer
              </Badge>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={() => setClaimsOpen(true)}
              aria-label="Ver reclamos de esta garantía"
            >
              <AlertTriangle className="size-4" aria-hidden />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={claimsOpen} onOpenChange={setClaimsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reclamos de Garantía</DialogTitle>
          </DialogHeader>
          <ClaimList warrantyId={warranty.id} />
        </DialogContent>
      </Dialog>
    </>
  )
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center text-muted-foreground">
      <ShieldCheck className="size-10 opacity-40" aria-hidden />
      <p className="text-pretty text-sm">{message}</p>
    </div>
  )
}
