import { getAdminClient } from './supabase-server'

export const FREE_TIER_LIMIT = 10

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
