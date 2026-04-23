'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/dexie/db'
import { Plus, Thermometer, Wrench } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import Link from 'next/link'
import Image from 'next/image'

const TAG_LABELS: Record<string, string> = {
  critical: 'Crítico',
  preventive_pending: 'Prev. Pendiente',
  active_warranty: 'Garantía Activa',
}
const TAG_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive'> = {
  critical: 'destructive',
  preventive_pending: 'secondary',
  active_warranty: 'default',
}

interface Props {
  equipmentId: string
}

export function EquipmentDetail({ equipmentId }: Props) {
  const equipment = useLiveQuery(() => db.equipment.get(equipmentId), [equipmentId])
  const services = useLiveQuery(
    () =>
      db.services
        .where({ equipment_id: equipmentId })
        .filter((s) => s.finalized && !s.deleted_at)
        .reverse()
        .sortBy('started_at'),
    [equipmentId]
  )

  if (!equipment) return null

  return (
    <div className="space-y-4">
      {/* Equipment info */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <Thermometer className="size-5 text-blue-500" aria-hidden />
              <CardTitle className="text-balance text-base">
                {equipment.brand} {equipment.model ?? ''}
              </CardTitle>
            </div>
            {equipment.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {equipment.tags.map((tag) => (
                  <Badge key={tag} variant={TAG_VARIANTS[tag] ?? 'secondary'} className="py-0 text-xs">
                    {TAG_LABELS[tag] ?? tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {equipment.refrigerant && (
            <p className="text-muted-foreground">Refrigerante: {equipment.refrigerant}</p>
          )}
          {equipment.placa_photo_url && (
            <div className="relative aspect-video w-full overflow-hidden rounded-lg border">
              <Image
                src={equipment.placa_photo_url}
                alt="Placa del equipo"
                fill
                className="object-cover"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Service history */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-balance text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Historial de Servicios
          </h2>
          <Link
            href="/service/new"
            className={cn(buttonVariants({ size: 'sm', variant: 'outline' }), 'touch-target')}
          >
            <Plus className="mr-1.5 size-3.5" aria-hidden />
            Nuevo
          </Link>
        </div>

        {services === undefined ? null : services.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-8 text-center text-muted-foreground">
            <Wrench className="size-8 opacity-40" aria-hidden />
            <p className="text-pretty text-sm">Sin servicios registrados.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {services.map((svc, i) => (
              <div key={svc.id}>
                {i > 0 && <Separator />}
                <div className="py-2">
                  <p className="text-sm font-medium">
                    {format(new Date(svc.started_at), "d 'de' MMMM yyyy", { locale: es })}
                  </p>
                  {svc.notes_text && (
                    <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground text-pretty">
                      {svc.notes_text}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
