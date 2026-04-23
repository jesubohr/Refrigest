import { Suspense } from 'react'
import { Package } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { InventoryScreen } from '@/components/features/parts/InventoryScreen'

export const metadata = { title: 'Inventario — Refrigest' }

export default function InventoryPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Package className="size-5 text-muted-foreground" aria-hidden />
        <h1 className="text-balance text-xl font-semibold">Inventario</h1>
      </div>

      <Suspense
        fallback={
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-14 w-full rounded-lg" />
            ))}
          </div>
        }
      >
        <InventoryScreen />
      </Suspense>
    </div>
  )
}
