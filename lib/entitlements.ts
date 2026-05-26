/**
 * lib/entitlements.ts
 *
 * First-consumer reference implementation of SPEC-0026's per-org limits axis.
 * - `isOverFreeLimit(orgId, resource)` is the CANONICAL public gate name (SPEC-0026
 *   §1/§6) — do NOT rename. Migration to the shared package is import-only.
 * - The cap map lives in `lib/limits.ts` (client-safe single source) and is re-exported
 *   here for server callers.
 * - Tier model: `organizations.subscription_tier` (paid => exempt). `getOrgLimits()`
 *   resolves it; `isOverFreeLimit()` enforces it.
 * - SEAM (Phase 5 only): swap the `subscription_tier` read for the shared
 *   @wri/entitlements / user_entitlements (user_id + tool_slug) keying. `@wri/entitlements`
 *   is an empty stub today and SPEC-0015 is unlocks-only, so this file IS the reference
 *   until Phase 5 reconciles.
 *
 * NOTE (SPEC-0026): the prior 10-incident free cap (`canLogIncident` / `FREE_TIER_LIMIT`)
 * is RETIRED — the 5-worker cap replaces it. Incident logging is uncapped for all tiers.
 */
import { getAdminClient } from './supabase-server'
import { FREE_LIMITS, type FreeLimits } from './limits'

export { FREE_LIMITS }
export type { FreeLimits }

// Internal cap-map reader. Reads organizations.subscription_tier.
//   paid -> null         (no cap / unlimited)
//   free -> FREE_LIMITS
export async function getOrgLimits(orgId: string): Promise<typeof FREE_LIMITS | null> {
  const admin = getAdminClient()

  const { data: org } = await admin
    .from('organizations')
    .select('subscription_tier')
    .eq('id', orgId)
    .single()

  const tier: 'free' | 'paid' = org?.subscription_tier === 'paid' ? 'paid' : 'free'

  return tier === 'paid' ? null : FREE_LIMITS
}

// PUBLIC GATE — canonical name per SPEC-0026 §1/§6. Do NOT rename.
// Paid org (getOrgLimits === null) is never over limit. Otherwise counts current
// ACTIVE rows of `resource` for the org and returns true when count >= cap.
export async function isOverFreeLimit(
  orgId: string,
  resource: keyof typeof FREE_LIMITS
): Promise<boolean> {
  const limits = await getOrgLimits(orgId)
  if (limits === null) return false

  const admin = getAdminClient()

  // resource 'workers' -> count active rows for the org.
  const { count } = await admin
    .from(resource)
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .eq('active', true)

  const used = count ?? 0
  return used >= limits[resource]
}
