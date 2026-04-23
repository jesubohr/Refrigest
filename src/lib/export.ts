import { db } from '@/lib/dexie/db'

/** Convert array of objects to CSV string */
function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return ''
  const headers = Object.keys(rows[0])
  const lines = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = row[h]
          if (val == null) return ''
          const str = String(val).replace(/"/g, '""')
          return str.includes(',') || str.includes('"') || str.includes('\n')
            ? `"${str}"`
            : str
        })
        .join(',')
    ),
  ]
  return lines.join('\n')
}

/** Download a CSV string as a file */
async function downloadCsv(filename: string, content: string): Promise<void> {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })

  // File System Access API (Chrome / Edge)
  if ('showSaveFilePicker' in window) {
    const handle = await (window as any).showSaveFilePicker({
      suggestedName: filename,
      types: [{ description: 'CSV', accept: { 'text/csv': ['.csv'] } }],
    })
    const writable = await handle.createWritable()
    await writable.write(blob)
    await writable.close()
    return
  }

  // Blob URL fallback (Firefox, Safari)
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

/** Export tech inventory as CSV */
export async function exportInventoryCsv(): Promise<void> {
  const parts = await db.parts.filter((p) => !p.deleted_at).toArray()
  const inventory = await db.tech_inventory.toArray()
  const stockMap = new Map(inventory.map((i) => [i.part_id, i.qty]))

  const rows = parts.map((p) => ({
    nombre: p.name,
    sku: p.sku ?? '',
    stock: stockMap.get(p.id) ?? 0,
  }))

  await downloadCsv(`refrigest-inventario-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows))
}

/** Export services as CSV */
export async function exportServicesCsv(): Promise<void> {
  const services = await db.services.filter((s) => s.finalized && !s.deleted_at).toArray()
  const rows = services.map((s) => ({
    id: s.id,
    equipo_id: s.equipment_id,
    inicio: s.started_at,
    fin: s.ended_at ?? '',
    notas: s.notes_text ?? '',
    finalizado: s.finalized ? 'Sí' : 'No',
  }))
  await downloadCsv(`refrigest-servicios-${new Date().toISOString().slice(0, 10)}.csv`, toCsv(rows))
}
