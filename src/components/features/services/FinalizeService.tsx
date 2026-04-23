'use client'

import { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/dexie/db'
import { FileText, ShieldCheck, Loader2, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { enqueue } from '@/lib/sync/outbox'
import { generateWarrantyNumber } from '@/core/business/warrantyNumber'
import { computeInventoryDelta } from '@/core/business/inventoryDelta'
import { useServiceDraft } from '@/hooks/useServiceDraft'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import { v4 as uuid } from 'uuid'

interface Props {
  serviceId: string
}

export function FinalizeService({ serviceId }: Props) {
  const router = useRouter()
  const { parts, reset } = useServiceDraft()
  const [finalizing, setFinalizing] = useState(false)
  const [finalized, setFinalized] = useState(false)

  const service = useLiveQuery(() => db.services.get(serviceId), [serviceId])
  const equipment = useLiveQuery(
    () => (service ? db.equipment.get(service.equipment_id) : undefined),
    [service]
  )

  async function handleFinalize(withWarranty: boolean) {
    setFinalizing(true)

    try {
      const now = new Date().toISOString()

      // 1. Mark service finalized
      await db.services.update(serviceId, {
        finalized: true,
        ended_at: now,
        updated_at: now,
      })
      await enqueue('services', 'update', serviceId, { finalized: true, ended_at: now })

      // 2. Apply inventory delta
      if (parts.length > 0) {
        const currentTech = await db.tech_inventory.toArray()
        const currentEq = service
          ? await db.equipment_inventory.where({ equipment_id: service.equipment_id }).toArray()
          : []

        const delta = computeInventoryDelta(currentTech, currentEq, parts)

        if (delta.insufficient.length > 0) {
          toast.error('Stock insuficiente para algunas partes')
          setFinalizing(false)
          return
        }

        for (const entry of delta.techInventory) {
          await db.tech_inventory.update(entry.part_id, { qty: entry.qty, updated_at: now })
        }
        for (const entry of delta.equipmentInventory) {
          await db.equipment_inventory.put({
            equipment_id: service!.equipment_id,
            part_id: entry.part_id,
            qty: entry.qty,
            updated_at: now,
            sync_version: 0,
          })
        }
      }

      // 3. Create report record
      const reportId = uuid()
      const uniqueNumber = generateWarrantyNumber()
      await db.reports.put({
        id: reportId,
        service_id: serviceId,
        tech_id: '',
        kind: withWarranty ? 'garantia' : 'asistencia',
        pdf_url: null,
        pdf_pending: true,
        unique_number: uniqueNumber,
        created_at: now,
        updated_at: now,
        sync_version: 0,
      })
      await enqueue('reports', 'insert', reportId, {
        id: reportId,
        service_id: serviceId,
        kind: withWarranty ? 'garantia' : 'asistencia',
        unique_number: uniqueNumber,
      })

      // 4. If warranty, create warranty record
      if (withWarranty) {
        const warrantyId = uuid()
        const expiresAt = new Date(new Date(now).getTime() + 90 * 24 * 60 * 60 * 1000)

        await db.warranties.put({
          id: warrantyId,
          report_id: reportId,
          tech_id: '',
          duration_days: 90,
          coverage: 'labor',
          starts_at: now,
          expires_at: expiresAt.toISOString(),
          created_at: now,
          updated_at: now,
          sync_version: 0,
        })
        await enqueue('warranties', 'insert', warrantyId, {
          id: warrantyId,
          report_id: reportId,
          duration_days: 90,
          coverage: 'labor',
          starts_at: now,
          expires_at: expiresAt.toISOString(),
        })

        // Update equipment tag
        if (service) {
          const eq = await db.equipment.get(service.equipment_id)
          if (eq) {
            const tags = [...new Set([...eq.tags, 'active_warranty' as const])] as typeof eq.tags
            await db.equipment.update(service.equipment_id, { tags, updated_at: now })
          }
        }
      }

      setFinalized(true)
      reset()
      toast.success('Servicio finalizado')
      router.push(`/today`)
    } catch (err) {
      toast.error('Error al finalizar el servicio')
      console.error(err)
    } finally {
      setFinalizing(false)
    }
  }

  if (!service) return null

  if (finalized) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <CheckCircle className="size-12 text-green-500" aria-hidden />
        <p className="text-balance text-lg font-semibold">Servicio finalizado</p>
        <p className="text-pretty text-sm text-muted-foreground">
          El reporte fue creado y se sincronizará cuando haya conexión.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-balance">Resumen del Servicio</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          {equipment && (
            <p>
              <span className="text-muted-foreground">Equipo: </span>
              {equipment.brand} {equipment.model ?? ''}
            </p>
          )}
          {service.notes_text && (
            <p>
              <span className="text-muted-foreground">Notas: </span>
              <span className="text-pretty line-clamp-3">{service.notes_text}</span>
            </p>
          )}
          {parts.length > 0 && (
            <p>
              <span className="text-muted-foreground">Partes: </span>
              {parts.length} ítem(s)
            </p>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="space-y-3">
        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button className="w-full touch-target" disabled={finalizing}>
                {finalizing && <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />}
                <FileText className="mr-2 size-4" aria-hidden />
                Generar Reporte de Asistencia
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Finalizar servicio?</AlertDialogTitle>
              <AlertDialogDescription className="text-pretty">
                Una vez finalizado, el servicio no podrá modificarse. Se generará un reporte de
                asistencia técnica.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleFinalize(false)}>
                Finalizar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <AlertDialog>
          <AlertDialogTrigger
            render={
              <Button variant="outline" className="w-full touch-target" disabled={finalizing}>
                <ShieldCheck className="mr-2 size-4" aria-hidden />
                Reporte + Garantía (90 días)
              </Button>
            }
          />
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Finalizar con garantía?</AlertDialogTitle>
              <AlertDialogDescription className="text-pretty">
                Se generará un certificado de garantía de 90 días mano de obra, además del reporte
                de asistencia.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={() => handleFinalize(true)}>
                Finalizar con Garantía
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  )
}
