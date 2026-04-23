import Link from 'next/link'
import { ChevronRight, Phone } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import type { Client } from '@/core/schemas/client'

export function ClientCard({ client }: { client: Client }) {
  return (
    <Link href={`/clients/${encodeURIComponent(client.whatsapp_e164)}`}>
      <Card className="cursor-pointer transition-colors hover:bg-muted/30">
        <CardContent className="flex items-center gap-3 py-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Phone className="size-4" aria-hidden />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{client.alias}</p>
            <p className="text-xs text-muted-foreground tabular">{client.whatsapp_e164}</p>
          </div>

          <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden />
        </CardContent>
      </Card>
    </Link>
  )
}
