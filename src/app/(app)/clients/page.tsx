import { Suspense } from 'react'
import { Users } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientList } from '@/components/features/clients/ClientList'

export const metadata = { title: 'Clientes — Refrigest' }

export default function ClientsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Users className="size-5 text-muted-foreground" aria-hidden />
        <h1 className="text-balance text-xl font-semibold">Clientes</h1>
      </div>

      <Suspense fallback={<ClientListSkeleton />}>
        <ClientList />
      </Suspense>
    </div>
  )
}

function ClientListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  )
}
