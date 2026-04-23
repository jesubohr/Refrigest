import Link from 'next/link'
import { ChevronRight, Thermometer } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Equipment } from '@/core/schemas/equipment'

const TAG_LABELS: Record<string, string> = {
  critical: 'Crítico',
  preventive_pending: 'Prev. Pendiente',
  active_warranty: 'Garantía',
}

const TAG_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive'> = {
  critical: 'destructive',
  preventive_pending: 'secondary',
  active_warranty: 'default',
}

export function EquipmentCard({
  equipment,
  wa,
}: {
  equipment: Equipment
  wa: string
}) {
  const branchHref = `/clients/${encodeURIComponent(wa)}/branches/${equipment.branch_id}/equipment/${equipment.id}`

  return (
    <Link href={branchHref}>
      <Card className="cursor-pointer transition-colors hover:bg-muted/30">
        <CardContent className="flex items-center gap-3 py-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-blue-500/10 text-blue-600">
            <Thermometer className="size-4" aria-hidden />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">
              {equipment.brand} {equipment.model ?? ''}
            </p>
            {equipment.refrigerant && (
              <p className="text-xs text-muted-foreground">{equipment.refrigerant}</p>
            )}
            {equipment.tags.length > 0 && (
              <div className="mt-1 flex flex-wrap gap-1">
                {equipment.tags.map((tag) => (
                  <Badge key={tag} variant={TAG_VARIANTS[tag] ?? 'secondary'} className="text-xs py-0">
                    {TAG_LABELS[tag] ?? tag}
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </CardContent>
      </Card>
    </Link>
  )
}
