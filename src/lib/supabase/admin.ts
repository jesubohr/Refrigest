import { createClient } from '@supabase/supabase-js'

/**
 * Service-role Supabase client — bypasses RLS.
 * Only for Edge Functions / server-side admin operations.
 * NEVER expose to the browser.
 */
export function createAdminClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Admin client must not be used in the browser.')
  }

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
