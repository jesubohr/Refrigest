import { z } from 'zod'
import { type ReportKind } from '../types'

export const reportSchema = z.object({
  id: z.string().uuid(),
  service_id: z.string().uuid(),
  tech_id: z.string().uuid(),
  kind: z.enum(['asistencia', 'garantia']),
  pdf_url: z.string().url().nullable().optional(),
  pdf_pending: z.boolean().default(true), // true = generated locally, upload pending
  unique_number: z.string().max(50), // RFG-YYMMDD-ULID8
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  sync_version: z.number().int().nonnegative().default(0),
})

export const reportCreateSchema = reportSchema.omit({
  tech_id: true,
  created_at: true,
  updated_at: true,
  sync_version: true,
})

export type Report = z.infer<typeof reportSchema>
export type ReportCreate = z.infer<typeof reportCreateSchema>
export type { ReportKind }
