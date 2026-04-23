import {
  Page,
  Text,
  View,
  Document,
  PDFDownloadLink,
} from '@react-pdf/renderer'
import { styles } from './shared'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export interface AsistenciaPdfData {
  uniqueNumber: string
  date: Date
  client: {
    alias: string
    whatsapp: string
    legalName?: string | null
  }
  branch: {
    name: string
    address?: string | null
  }
  equipment: {
    brand: string
    model?: string | null
    refrigerant?: string | null
  }
  service: {
    notes?: string | null
    transcript?: string | null
    checklist?: {
      pressures?: { high_side_psi?: number | null; low_side_psi?: number | null }
      electrical?: { amperage_a?: number | null; voltage_v?: number | null }
      temperatures?: { supply_c?: number | null; return_c?: number | null }
    } | null
  }
  parts: Array<{ name: string; qty: number }>
}

export function AsistenciaPdfDocument({ data }: { data: AsistenciaPdfData }) {
  const { client, branch, equipment, service, parts } = data
  const dateStr = format(data.date, "d 'de' MMMM yyyy", { locale: es })

  return (
    <Document
      title={`Refrigest — Asistencia Técnica ${data.uniqueNumber}`}
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
            <Text style={styles.badge}>Asistencia Técnica</Text>
            <Text style={[styles.subtitle, { marginTop: 4, textAlign: 'right' }]}>
              N° {data.uniqueNumber}
            </Text>
            <Text style={[styles.subtitle, { textAlign: 'right' }]}>{dateStr}</Text>
          </View>
        </View>

        {/* Client */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Datos del Cliente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre / Alias:</Text>
            <Text style={styles.value}>{client.alias}</Text>
          </View>
          {client.legalName && (
            <View style={styles.row}>
              <Text style={styles.label}>Razón Social:</Text>
              <Text style={styles.value}>{client.legalName}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>WhatsApp:</Text>
            <Text style={styles.value}>{client.whatsapp}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Sucursal:</Text>
            <Text style={styles.value}>{branch.name}</Text>
          </View>
          {branch.address && (
            <View style={styles.row}>
              <Text style={styles.label}>Dirección:</Text>
              <Text style={styles.value}>{branch.address}</Text>
            </View>
          )}
        </View>

        {/* Equipment */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipo</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Marca / Modelo:</Text>
            <Text style={styles.value}>
              {equipment.brand} {equipment.model ?? ''}
            </Text>
          </View>
          {equipment.refrigerant && (
            <View style={styles.row}>
              <Text style={styles.label}>Refrigerante:</Text>
              <Text style={styles.value}>{equipment.refrigerant}</Text>
            </View>
          )}
        </View>

        {/* Readings */}
        {service.checklist && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Lecturas</Text>
            {service.checklist.pressures && (
              <>
                <View style={styles.row}>
                  <Text style={styles.label}>Presión alta:</Text>
                  <Text style={styles.value}>
                    {service.checklist.pressures.high_side_psi ?? '—'} psi
                  </Text>
                </View>
                <View style={styles.row}>
                  <Text style={styles.label}>Presión baja:</Text>
                  <Text style={styles.value}>
                    {service.checklist.pressures.low_side_psi ?? '—'} psi
                  </Text>
                </View>
              </>
            )}
            {service.checklist.electrical && (
              <View style={styles.row}>
                <Text style={styles.label}>Amperaje:</Text>
                <Text style={styles.value}>
                  {service.checklist.electrical.amperage_a ?? '—'} A
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Parts */}
        {parts.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Partes Utilizadas</Text>
            {parts.map((p, i) => (
              <View key={i} style={styles.row}>
                <Text style={styles.label}>{p.name}</Text>
                <Text style={styles.value}>x{p.qty}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {(service.notes || service.transcript) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observaciones</Text>
            <Text style={{ fontSize: 9, lineHeight: 1.5 }}>
              {service.notes || service.transcript}
            </Text>
          </View>
        )}

        {/* Signature */}
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
          <Text style={styles.footerText}>Refrigest — Servicio Técnico</Text>
          <Text style={styles.footerText}>N° {data.uniqueNumber}</Text>
        </View>
      </Page>
    </Document>
  )
}
