import { createServerClient } from '@supabase/ssr'
import { createClient as createAdminRaw } from '@supabase/supabase-js'
import { cookies } from 'next/headers'

export async function getServerClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}

export function getAdminClient() {
  return createAdminRaw(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
}

export type UserContext = {
  user: { id: string; email?: string }
  profile: { id: string; org_id: string; email: string; role: string }
  supabase: Awaited<ReturnType<typeof getServerClient>>
}

export async function getUserContext(): Promise<UserContext | null> {
  const supabase = await getServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  const { data: profile } = await supabase
    .from('users')
    .select('id, org_id, email, role')
    .eq('id', user.id)
    .single()
  if (!profile || !profile.org_id) return null
  return {
    user: { id: user.id, email: user.email },
    profile: profile as { id: string; org_id: string; email: string; role: string },
    supabase,
  }
}
