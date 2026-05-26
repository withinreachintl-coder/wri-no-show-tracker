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
 * NOTE: the cap value below is a runtime mirror of `entitlements.FREE_LIMITS`. It cannot
 * be value-imported from lib/entitlements.ts because that module's graph pulls
 * `getAdminClient -> next/headers`, which is server-only and breaks a client bundle.
 * The TYPE is imported from there (erased at build); the single source reconciles when
 * SPEC-0015 Phase 5 moves the cap map into the shared @wri/entitlements package.
 */
import { useEffect, useState } from 'react'
import { createClient } from './supabase'
import type { FreeLimits } from './entitlements'

const FREE_LIMITS: FreeLimits = { workers: 5 }

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
