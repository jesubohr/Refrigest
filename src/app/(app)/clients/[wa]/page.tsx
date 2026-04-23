import { Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { ClientDetail } from '@/components/features/clients/ClientDetail'

interface Props {
  params: Promise<{ wa: string }>
}

export default async function ClientDetailPage({ params }: Props) {
  const { wa } = await params
  const decodedWa = decodeURIComponent(wa)

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Link
          href="/clients"
          aria-label="Volver a clientes"
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-8')}
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <h1 className="text-balance text-xl font-semibold">{decodedWa}</h1>
      </div>

      <Suspense fallback={<DetailSkeleton />}>
        <ClientDetail wa={decodedWa} />
      </Suspense>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-20 w-full rounded-lg" />
      <Skeleton className="h-32 w-full rounded-lg" />
    </div>
  )
}
