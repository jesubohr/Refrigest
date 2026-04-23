import { z } from 'zod'

export const branchSchema = z.object({
  id: z.string().uuid(),
  client_wa: z.string(),
  tech_id: z.string().uuid(),
  name: z.string().min(1, 'Branch name is required').max(200),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lng: z.number().min(-180).max(180).nullable().optional(),
  address: z.string().max(500).nullable().optional(),
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  deleted_at: z.string().datetime().nullable().optional(),
  sync_version: z.number().int().nonnegative().default(0),
})

export const branchCreateSchema = branchSchema.omit({
  tech_id: true,
  created_at: true,
  updated_at: true,
  deleted_at: true,
  sync_version: true,
})

export type Branch = z.infer<typeof branchSchema>
export type BranchCreate = z.infer<typeof branchCreateSchema>
