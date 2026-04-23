import { z } from 'zod'

export const claimSchema = z.object({
  id: z.string().uuid(),
  warranty_id: z.string().uuid(),
  tech_id: z.string().uuid(),
  date: z.string().datetime(),
  notes: z.string().max(2000).nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  sync_version: z.number().int().nonnegative().default(0),
})

export const claimCreateSchema = claimSchema.omit({
  tech_id: true,
  created_at: true,
  updated_at: true,
  sync_version: true,
})

export type Claim = z.infer<typeof claimSchema>
export type ClaimCreate = z.infer<typeof claimCreateSchema>
