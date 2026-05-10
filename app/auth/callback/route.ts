import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { sendWelcomeEmail } from '../../../lib/welcome'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/dashboard'

  if (!code) {
    console.error('[auth/callback] No code provided')
    return NextResponse.redirect(new URL('/login?error=no_code', request.url))
  }

  try {
    const cookieStore = await cookies()

    const supabase = createServerClient(
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

    const { error: exchangeError, data } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError || !data?.user) {
      console.error('[auth/callback] Code exchange failed:', exchangeError?.message)
      return NextResponse.redirect(new URL('/login?error=auth_failed', request.url))
    }

    const user = data.user

    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('org_id')
      .eq('id', user.id)
      .single()

    if (existingUser?.org_id) {
      const redirectTo = next.startsWith('/') ? next : '/dashboard'
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }

    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .upsert(
        {
          name: user.email?.split('@')[0] || 'My Business',
          owner_email: user.email,
          subscription_tier: 'free',
          subscription_status: 'trial',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: 'owner_email', ignoreDuplicates: false }
      )
      .select('id')
      .single()

    if (orgError || !org?.id) {
      console.error('[auth/callback] Org upsert failed:', orgError?.message)
      return NextResponse.redirect(new URL('/login?error=org_failed', request.url))
    }

    const { error: userError } = await supabaseAdmin
      .from('users')
      .upsert(
        {
          id: user.id,
          org_id: org.id,
          email: user.email,
          name: user.email,
          role: 'admin',
        },
        { onConflict: 'id', ignoreDuplicates: false }
      )

    if (userError) {
      console.error('[auth/callback] User upsert failed:', userError?.message)
    }

    // Welcome email (non-blocking, errors logged but don't break flow)
    if (user.email) {
      const orgName = user.email.split('@')[0] || 'My Business'
      sendWelcomeEmail(user.email, orgName).catch((e) =>
        console.error('[auth/callback] welcome email failed:', e)
      )
    }

    const redirectTo = next.startsWith('/') ? next : '/dashboard'
    return NextResponse.redirect(new URL(redirectTo, request.url))
  } catch (err) {
    console.error('[auth/callback] Unexpected error:', err instanceof Error ? err.message : String(err))
    return NextResponse.redirect(new URL('/login?error=unexpected', request.url))
  }
}
