/**
 * WhatsApp deep link builder.
 * Works offline — generates the URL; the browser opens it.
 */

export interface WhatsAppMessageParams {
  /** E.164 phone number, e.g. +5491123456789 */
  phoneE164: string
  /** Text message to pre-fill */
  message: string
}

/** Build a wa.me deep link */
export function buildWhatsAppLink({ phoneE164, message }: WhatsAppMessageParams): string {
  // Strip leading + for wa.me format
  const phone = phoneE164.replace(/^\+/, '')
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

/** Build the report share message */
export function buildReportMessage(params: {
  clientAlias: string
  reportKind: 'asistencia' | 'garantia'
  pdfUrl: string
  uniqueNumber: string
}): string {
  const kindLabel = params.reportKind === 'asistencia' ? 'Asistencia Técnica' : 'Certificado de Garantía'
  return [
    `Hola ${params.clientAlias},`,
    ``,
    `Le envío el reporte de *${kindLabel}* (N° ${params.uniqueNumber}).`,
    ``,
    `📄 Ver reporte: ${params.pdfUrl}`,
    ``,
    `Cualquier consulta, estoy a su disposición.`,
  ].join('\n')
}

/** Open the wa.me link in a new tab */
export function openWhatsApp(params: WhatsAppMessageParams): void {
  window.open(buildWhatsAppLink(params), '_blank', 'noopener,noreferrer')
}
