import { Suspense } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import { EquipmentDetail } from '@/components/features/equipment/EquipmentDetail'

interface Props {
  params: Promise<{ wa: string; id: string; eid: string }>
}

export default async function EquipmentDetailPage({ params }: Props) {
  const { wa, id, eid } = await params

  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <div className="mb-6 flex items-center gap-2">
        <Link
          href={`/clients/${wa}/branches/${id}`}
          aria-label="Volver a sucursal"
          className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), 'size-8')}
        >
          <ArrowLeft className="size-4" aria-hidden />
        </Link>
        <h1 className="text-balance text-xl font-semibold">Hoja de Vida</h1>
      </div>

      <Suspense fallback={<Skeleton className="h-64 w-full rounded-lg" />}>
        <EquipmentDetail equipmentId={eid} />
      </Suspense>
    </div>
  )
}
