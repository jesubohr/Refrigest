import Link from 'next/link'
import { ChevronRight, MapPin } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Branch } from '@/core/schemas/branch'

export function BranchCard({ branch, wa }: { branch: Branch; wa: string }) {
  return (
    <Link href={`/clients/${encodeURIComponent(wa)}/branches/${branch.id}`}>
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
            {branch.lat && branch.lng && (
              <p className="text-xs text-muted-foreground tabular">
                {branch.lat.toFixed(5)}, {branch.lng.toFixed(5)}
              </p>
            )}
          </div>

          <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </CardContent>
      </Card>
    </Link>
  )
}
