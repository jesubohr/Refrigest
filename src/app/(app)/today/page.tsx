import { Suspense } from 'react'
import { CalendarClock, Plus } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import { TodayAgenda } from '@/components/features/today/TodayAgenda'

export const metadata = { title: 'Hoy — Refrigest' }

export default function TodayPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CalendarClock className="size-5 text-muted-foreground" aria-hidden />
          <h1 className="text-balance text-xl font-semibold">Hoy</h1>
        </div>
        <Link href="/service/new" className={cn(buttonVariants({ size: 'sm' }), 'touch-target')}>
          <Plus className="mr-1.5 size-4" aria-hidden />
          Nuevo Servicio
        </Link>
      </div>

      {/* Agenda */}
      <Suspense fallback={<AgendaSkeleton />}>
        <TodayAgenda />
      </Suspense>
    </div>
  )
}

function AgendaSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-20 w-full rounded-lg" />
      ))}
    </div>
  )
}
