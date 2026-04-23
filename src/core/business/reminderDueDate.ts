import type { ReminderKind } from '../types'

const SIX_MONTHS_MS = 6 * 30 * 24 * 60 * 60 * 1000 // approx 6 months in ms

/**
 * Compute the due date for a reminder.
 * Pure function — no framework deps.
 */
export function computeReminderDueDate(
  kind: ReminderKind,
  referenceDate: Date
): Date {
  switch (kind) {
    case 'preventive_6mo': {
      const due = new Date(referenceDate.getTime() + SIX_MONTHS_MS)
      return due
    }
    case 'warranty_expiry': {
      // Due 7 days before expiry so the tech has time to notify the client
      const due = new Date(referenceDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      return due
    }
    default: {
      const _exhaustive: never = kind
      throw new Error(`Unknown reminder kind: ${_exhaustive}`)
    }
  }
}

/**
 * Check if a reminder is due within the next N days from now.
 */
export function isReminderDueSoon(dueAt: Date, withinDays = 7): boolean {
  const now = new Date()
  const cutoff = new Date(now.getTime() + withinDays * 24 * 60 * 60 * 1000)
  return dueAt >= now && dueAt <= cutoff
}
