/**
 * lib/entitlements.ts
 *
 * First-consumer PROVISIONAL reference implementation of SPEC-0026's limits axis.
 * - `isOverFreeLimit(orgId, resource)` is the CANONICAL public gate name (SPEC-0026
 *   §1/§6) — do NOT rename. Downstream migration to the shared package is import-only.
 * - The worker cap and the existing incident cap share ONE tier model:
 *   `organizations.subscription_tier` (paid => exempt). `getOrgLimits()` reads it the
 *   same way `canLogIncident()` does.
 * - Client-hook shape (`lib/useEntitlements.ts`) is PROVISIONAL, pending the SPEC-0015
 *   Phase 5 unlocks layer, which unions an `entitlements` field into the hook's return
 *   without renaming `limits`.
 * - `@wri/entitlements` is an empty stub today and SPEC-0015 is unlocks-only, so there
 *   is no upstream limits contract to mirror — this file IS the reference until Phase 5
 *   reconciles.
 *
 * SCAFFOLD ONLY (SPEC-0026 Pass 1): `getOrgLimits` / `isOverFreeLimit` are defined but
 * NOT wired into any route. The incident cap (`canLogIncident`) is unchanged and live.
 */
import { getAdminClient } from './supabase-server'

export const FREE_TIER_LIMIT = 10

// SPEC-0026 free-tier cap map, per-org. resource 'workers' = SPEC-0026 'org_employees';
// repo table is `workers`, counted where active = true.
export const FREE_LIMITS = { workers: 5 }
export type FreeLimits = typeof FREE_LIMITS

export type EntitlementCheck = {
  ok: boolean
  used: number
  limit: number | null
  tier: 'free' | 'paid'
  upgradeUrl: string | null
}

export async function canLogIncident(orgId: string): Promise<EntitlementCheck> {
  const admin = getAdminClient()

  const { data: org } = await admin
    .from('organizations')
    .select('subscription_tier')
    .eq('id', orgId)
    .single()

  const tier: 'free' | 'paid' = org?.subscription_tier === 'paid' ? 'paid' : 'free'

  if (tier === 'paid') {
    return { ok: true, used: 0, limit: null, tier, upgradeUrl: null }
  }

  const { count } = await admin
    .from('incidents')
    .select('*', { count: 'exact', head: true })
    .eq('org_id', orgId)
    .is('deleted_at', null)

  const used = count ?? 0
  return {
    ok: used < FREE_TIER_LIMIT,
    used,
    limit: FREE_TIER_LIMIT,
    tier,
    upgradeUrl: process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || '/billing',
  }
}

// ─── SPEC-0026 worker-cap limits axis (scaffold — defined, NOT wired) ───────────

// Internal cap-map reader. Reads organizations.subscription_tier exactly as
// canLogIncident does (same admin client + select pattern).
//   paid -> null         (no cap / unlimited; mirrors the incident-cap exemption)
//   free -> FREE_LIMITS
// SEAM (Phase 5 only): swap this subscription_tier read for the shared
// @wri/entitlements / user_entitlements (user_id + tool_slug) keying.
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
