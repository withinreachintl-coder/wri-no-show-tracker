'use client'

/**
 * lib/useEntitlements.ts
 *
 * PROVISIONAL client hook for SPEC-0026's limits axis. SCAFFOLD ONLY — no component
 * consumes it this pass. Returns the resolved free-tier cap map for the current org:
 *   - limits === null        => no cap applies (paid org)
 *   - limits === FREE_LIMITS => free org, caps apply
 *
 * FORWARD-COMPAT: the SPEC-0015 Phase 5 unlocks hook ADDS an `entitlements` field to
 * this same return object. Do NOT rename the hook or restructure `limits` — unlocks
 * unions in later.
 *
 * Cap map is imported from the client-safe single source lib/limits.ts (NOT from
 * lib/entitlements.ts, whose graph pulls server-only next/headers).
 */
import { useEffect, useState } from 'react'
import { createClient } from './supabase'
import { FREE_LIMITS, type FreeLimits } from './limits'

export function useEntitlements(): { limits: FreeLimits | null; loading: boolean } {
  const [limits, setLimits] = useState<FreeLimits | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    ;(async () => {
      const supabase = createClient()

      const {
        data: { user },
      } = await supabase.auth.getUser()

      let tier: 'free' | 'paid' = 'free'

      if (user) {
        const { data: profile } = await supabase
          .from('users')
          .select('org_id')
          .eq('id', user.id)
          .single()

        if (profile?.org_id) {
          const { data: org } = await supabase
            .from('organizations')
            .select('subscription_tier')
            .eq('id', profile.org_id)
            .single()

          tier = org?.subscription_tier === 'paid' ? 'paid' : 'free'
        }
      }

      if (active) {
        setLimits(tier === 'paid' ? null : FREE_LIMITS)
        setLoading(false)
      }
    })()

    return () => {
      active = false
    }
  }, [])

  return { limits, loading }
}
