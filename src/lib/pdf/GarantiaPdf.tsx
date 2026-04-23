import { Page, Text, View, Document } from '@react-pdf/renderer'
import { styles } from './shared'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export interface GarantiaPdfData {
  uniqueNumber: string
  date: Date
  client: {
    alias: string
    whatsapp: string
    legalName?: string | null
  }
  equipment: {
    brand: string
    model?: string | null
  }
  warranty: {
    durationDays: 30 | 90 | 180
    coverage: 'labor' | 'full'
    startsAt: Date
    expiresAt: Date
  }
  parts: Array<{ name: string; qty: number }>
}

const COVERAGE_LABEL: Record<string, string> = {
  labor: 'Mano de Obra',
  full: 'Total (Mano de Obra y Materiales)',
}

const DURATION_LABEL: Record<number, string> = {
  30: 'treinta (30) días',
  90: 'noventa (90) días',
  180: 'ciento ochenta (180) días',
}

export function GarantiaPdfDocument({ data }: { data: GarantiaPdfData }) {
  const { client, equipment, warranty, parts } = data
  const dateStr = format(data.date, "d 'de' MMMM 'de' yyyy", { locale: es })
  const startStr = format(warranty.startsAt, "d 'de' MMMM 'de' yyyy", { locale: es })
  const expiryStr = format(warranty.expiresAt, "d 'de' MMMM 'de' yyyy", { locale: es })

  return (
    <Document
      title={`Refrigest — Certificado de Garantía ${data.uniqueNumber}`}
      author="Refrigest"
      creator="Refrigest"
    >
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>REFRIGEST</Text>
            <Text style={styles.subtitle}>Servicio Técnico de Refrigeración</Text>
          </View>
          <View>
            <Text style={styles.badge}>Certificado de Garantía</Text>
            <Text style={[styles.subtitle, { marginTop: 4, textAlign: 'right' }]}>
              N° {data.uniqueNumber}
            </Text>
            <Text style={[styles.subtitle, { textAlign: 'right' }]}>{dateStr}</Text>
          </View>
        </View>

        {/* Guarantee declaration */}
        <View style={[styles.section, { marginBottom: 20 }]}>
          <Text style={{ fontSize: 10, lineHeight: 1.6 }}>
            Por medio del presente certificado se hace constar que el servicio técnico
            realizado el día {startStr} sobre el equipo{' '}
            <Text style={styles.bold}>
              {equipment.brand} {equipment.model ?? ''}
            </Text>{' '}
            perteneciente al cliente{' '}
            <Text style={styles.bold}>{client.alias}</Text> queda cubierto bajo garantía
            de <Text style={styles.bold}>{DURATION_LABEL[warranty.durationDays]}</Text>,
            cobertura:{' '}
            <Text style={styles.bold}>{COVERAGE_LABEL[warranty.coverage]}</Text>.
          </Text>
        </View>

        {/* Warranty details */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Detalles de Garantía</Text>
          <View style={styles.row}>
            <Text style={styles.label}>N° Certificado:</Text>
            <Text style={[styles.value, styles.bold]}>{data.uniqueNumber}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Duración:</Text>
            <Text style={styles.value}>{warranty.durationDays} días</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Cobertura:</Text>
            <Text style={styles.value}>{COVERAGE_LABEL[warranty.coverage]}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Válida desde:</Text>
            <Text style={styles.value}>{startStr}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Vencimiento:</Text>
            <Text style={[styles.value, styles.bold]}>{expiryStr}</Text>
          </View>
        </View>

        {/* Client & equipment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente y Equipo</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Cliente:</Text>
            <Text style={styles.value}>{client.alias}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>WhatsApp:</Text>
            <Text style={styles.value}>{client.whatsapp}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Equipo:</Text>
            <Text style={styles.value}>
              {equipment.brand} {equipment.model ?? ''}
            </Text>
          </View>
        </View>

        {/* Parts covered */}
        {parts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Partes / Materiales Reemplazados</Text>
            {parts.map((p, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.label}>{p.name}</Text>
                <Text style={styles.value}>x{p.qty}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Terms */}
        <View style={[styles.section, { marginTop: 8 }]}>
          <View style={styles.warningBox}>
            <Text style={{ fontFamily: 'Helvetica-Bold', marginBottom: 4 }}>
              Condiciones de garantía:
            </Text>
            <Text>• La garantía no cubre daños por mal uso, sobrecargas eléctricas, o falta de mantenimiento.</Text>
            <Text>• Para hacer válida la garantía presentar este certificado.</Text>
            <Text>• La garantía queda nula si el equipo fue intervenido por terceros.</Text>
          </View>
        </View>

        {/* Signatures */}
        <View style={[styles.section, { marginTop: 32 }]}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <View style={{ width: '45%' }}>
              <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#333', height: 30 }} />
              <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 4 }]}>
                Firma del Técnico
              </Text>
            </View>
            <View style={{ width: '45%' }}>
              <View style={{ borderBottomWidth: 0.5, borderBottomColor: '#333', height: 30 }} />
              <Text style={[styles.subtitle, { textAlign: 'center', marginTop: 4 }]}>
                Firma del Cliente / Responsable
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Refrigest — Servicio Técnico de Refrigeración</Text>
          <Text style={styles.footerText}>Certificado N° {data.uniqueNumber}</Text>
        </View>
      </Page>
    </Document>
  )
}
