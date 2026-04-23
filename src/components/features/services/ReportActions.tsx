'use client'

import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '@/lib/dexie/db'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { AsistenciaPdfDocument } from '@/lib/pdf/AsistenciaPdf'
import { GarantiaPdfDocument } from '@/lib/pdf/GarantiaPdf'
import { openWhatsApp } from '@/lib/whatsapp'
import { Download, MessageCircle, Loader2 } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  serviceId: string
}

export function ReportActions({ serviceId }: Props) {
  const data = useLiveQuery(async () => {
    const report = await db.reports.where({ service_id: serviceId }).first()
    if (!report) return null

    const service = await db.services.get(serviceId)
    if (!service) return null

    const equipment = await db.equipment.get(service.equipment_id)
    if (!equipment) return null

    const branch = await db.branches.get(equipment.branch_id)
    if (!branch) return null

    const client = await db.clients.get(branch.client_wa)
    if (!client) return null

    const serviceParts = await db.service_parts.where({ service_id: serviceId }).toArray()
    const parts = await Promise.all(
      serviceParts.map(async (sp) => {
        const part = await db.parts.get(sp.part_id)
        return { name: part?.name ?? sp.part_id, qty: sp.qty }
      })
    )

    const warranty =
      report.kind === 'garantia'
        ? await db.warranties.where({ report_id: report.id }).first()
        : null

    return { report, service, equipment, branch, client, parts, warranty }
  }, [serviceId])

  if (!data) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Loader2 className="size-4 animate-spin" aria-hidden />
        Cargando reporte...
      </div>
    )
  }

  const { report, service, equipment, branch, client, parts, warranty } = data

  const asistenciaData = {
    uniqueNumber: report.unique_number,
    date: new Date(report.created_at ?? new Date()),
    client: {
      alias: client.alias,
      whatsapp: client.whatsapp_e164,
      legalName: client.legal_name,
    },
    branch: {
      name: branch.name,
      address: branch.address,
    },
    equipment: {
      brand: equipment.brand,
      model: equipment.model,
      refrigerant: equipment.refrigerant,
    },
    service: {
      notes: service.notes_text,
      transcript: service.voice_transcript,
      checklist: service.checklist_jsonb,
    },
    parts,
  }

  const warrantyData =
    warranty && report.kind === 'garantia'
      ? {
          uniqueNumber: report.unique_number,
          date: new Date(report.created_at ?? new Date()),
          client: {
            alias: client.alias,
            whatsapp: client.whatsapp_e164,
            legalName: client.legal_name,
          },
          equipment: {
            brand: equipment.brand,
            model: equipment.model,
          },
          warranty: {
            durationDays: warranty.duration_days,
            coverage: warranty.coverage,
            startsAt: new Date(warranty.starts_at),
            expiresAt: new Date(warranty.expires_at),
          },
          parts,
        }
      : null

  function handleWhatsApp() {
    openWhatsApp({
      phoneE164: client.whatsapp_e164,
      message: [
        `Hola ${client.alias},`,
        ``,
        `Le envío el reporte de *Asistencia Técnica* N° ${report.unique_number}.`,
        ``,
        `Gracias por confiar en Refrigest. Cualquier consulta estoy a disposición.`,
      ].join('\n'),
    })
  }

  const asistenciaFileName = `Refrigest-${report.unique_number}.pdf`
  const garantiaFileName = `Refrigest-Garantia-${report.unique_number}.pdf`

  return (
    <div className="space-y-2">
      {/* Asistencia PDF download */}
      <PDFDownloadLink
        document={<AsistenciaPdfDocument data={asistenciaData} />}
        fileName={asistenciaFileName}
        className={cn(buttonVariants(), 'w-full touch-target')}
      >
        {({ loading }) =>
          loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
              Generando PDF...
            </>
          ) : (
            <>
              <Download className="mr-2 size-4" aria-hidden />
              Descargar Reporte de Asistencia
            </>
          )
        }
      </PDFDownloadLink>

      {/* Garantía PDF download */}
      {warrantyData && (
        <PDFDownloadLink
          document={<GarantiaPdfDocument data={warrantyData} />}
          fileName={garantiaFileName}
          className={cn(buttonVariants({ variant: 'outline' }), 'w-full touch-target')}
        >
          {({ loading }) =>
            loading ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                Generando certificado...
              </>
            ) : (
              <>
                <Download className="mr-2 size-4" aria-hidden />
                Descargar Certificado de Garantía
              </>
            )
          }
        </PDFDownloadLink>
      )}

      {/* WhatsApp */}
      <Button variant="outline" className="w-full touch-target" onClick={handleWhatsApp}>
        <MessageCircle className="mr-2 size-4" aria-hidden />
        Enviar por WhatsApp
      </Button>
    </div>
  )
}
