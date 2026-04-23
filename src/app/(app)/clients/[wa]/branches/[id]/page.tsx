import { Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { BranchDetail } from '@/components/features/branches/BranchDetail'

interface Props {
  params: Promise<{ wa: string; id: string }>
}

export default async function BranchDetailPage({ params }: Props) {
  const { wa, id } = await params
  const decodedWa = decodeURIComponent(wa)

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Link
          href={`/clients/${wa}`}
          aria-label="Volver al cliente"
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-8')}
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <h1 className="text-balance text-xl font-semibold">Sucursal</h1>
      </div>

      <Suspense fallback={<Skeleton className="h-48 w-full rounded-lg" />}>
        <BranchDetail branchId={id} wa={decodedWa} />
      </Suspense>
    </div>
  )
}
