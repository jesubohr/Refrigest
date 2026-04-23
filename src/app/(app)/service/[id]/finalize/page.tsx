import { Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { FinalizeService } from '@/components/features/services/FinalizeService'

interface Props {
  params: Promise<{ id: string }>
}

export default async function FinalizePage({ params }: Props) {
  const { id } = await params

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Link
          href="/service/new"
          aria-label="Volver al servicio"
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-8')}
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <h1 className="text-balance text-xl font-semibold">Finalizar Servicio</h1>
      </div>

      <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
        <FinalizeService serviceId={id} />
      </Suspense>
    </div>
  )
}
