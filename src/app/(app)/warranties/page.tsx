import { Suspense } from 'react'
import { ShieldCheck } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { WarrantyList } from '@/components/features/warranties/WarrantyList'

export const metadata = { title: 'Garantías — Refrigest' }

export default function WarrantiesPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <ShieldCheck className="size-5 text-muted-foreground" aria-hidden />
        <h1 className="text-balance text-xl font-semibold">Garantías</h1>
      </div>

      <Suspense
        fallback={
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        }
      >
        <WarrantyList />
      </Suspense>
    </div>
  )
}
