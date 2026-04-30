import { createClient } from '@supabase/supabase-js'
import { createMockClient } from '@/lib/demo/mock-client'

// Cliente con service role — solo usar en server-side (Server Actions, Route Handlers)
export function createAdminClient() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createMockClient() as any
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
