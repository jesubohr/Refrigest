import { ulid } from 'ulid'

/**
 * Generate a warranty unique number: RFG-YYMMDD-ULID8
 * Pure function — no framework deps, safe in core/.
 *
 * @param date - The date to use (defaults to now). Allows deterministic tests.
 */
export function generateWarrantyNumber(date: Date = new Date()): string {
  const yy = String(date.getFullYear()).slice(-2)
  const mm = String(date.getMonth() + 1).padStart(2, '0')
  const dd = String(date.getDate()).padStart(2, '0')
  const suffix = ulid().slice(-8).toUpperCase()
  return `RFG-${yy}${mm}${dd}-${suffix}`
}
