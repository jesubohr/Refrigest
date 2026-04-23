import { z } from 'zod'

/** WhatsApp E.164 phone number — e.g. +5491123456789 */
export const waE164Schema = z
  .string()
  .regex(/^\+[1-9]\d{7,14}$/, 'Must be a valid E.164 phone number (e.g. +5491123456789)')

export const clientSchema = z.object({
  whatsapp_e164: waE164Schema,
  tech_id: z.string().uuid(),
  alias: z.string().min(1, 'Alias is required').max(100),
  legal_name: z.string().max(200).nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  deleted_at: z.string().datetime().nullable().optional(),
  sync_version: z.number().int().nonnegative().default(0),
})

export const clientCreateSchema = clientSchema
  .omit({ tech_id: true, created_at: true, updated_at: true, deleted_at: true, sync_version: true })

export type Client = z.infer<typeof clientSchema>
export type ClientCreate = z.infer<typeof clientCreateSchema>
