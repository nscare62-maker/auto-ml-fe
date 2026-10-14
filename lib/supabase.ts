import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  'placeholder-anon-key'

/**
 * Client-safe Supabase instance using anonymous key.
 * Can be used in React Client Components or Server Components.
 */
export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)

/**
 * Service Role Supabase instance for server-only operations that bypass RLS.
 * Never call this from client components.
 */
export function getServiceSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not defined in environment variables')
  }
  return createClient(supabaseUrl, serviceRoleKey)
}
