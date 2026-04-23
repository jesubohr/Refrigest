import { ServiceWizard } from '@/components/features/services/ServiceWizard'

export const metadata = { title: 'Nuevo Servicio — Refrigest' }

export default function NewServicePage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-6">
      <h1 className="mb-6 text-balance text-xl font-semibold">Nuevo Servicio</h1>
      <ServiceWizard />
    </div>
  )
}
