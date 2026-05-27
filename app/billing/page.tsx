'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

type Worker = { id: string; active: boolean }

export default function BillingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [tier, setTier] = useState<'free' | 'paid'>('free')
  const [activeWorkers, setActiveWorkers] = useState(0)
  const [workerLimit, setWorkerLimit] = useState<number | null>(null)
  const [orgId, setOrgId] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }
      const { data: profile } = await supabase
        .from('users')
        .select('org_id')
        .eq('id', user.id)
        .single()
      if (cancelled) return
      const oId = profile?.org_id ?? null
      setOrgId(oId)
      if (oId) {
        const { data: org } = await supabase
          .from('organizations')
          .select('subscription_tier')
          .eq('id', oId)
          .single()
        setTier(org?.subscription_tier === 'paid' ? 'paid' : 'free')
      }
      // SPEC-0026: usage line shows active workers vs the free-tier cap (the
      // 10-incident cap is retired). Reuses the same server-authoritative shape
      // GET /api/workers returns to the /workers page — no separate counter API.
      const r = await fetch('/api/workers')
      const data = await r.json()
      const list: Worker[] = data.workers || []
      if (cancelled) return
      setActiveWorkers(list.filter((w) => w.active).length)
      setWorkerLimit(typeof data.limit === 'number' ? data.limit : null)
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-900 px-6 py-16">
        <p className="font-dmsans text-sm text-stone-300">Loading...</p>
      </main>
    )
  }

  const buyLinkBase = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK
  const buyLink =
    buyLinkBase && !buyLinkBase.startsWith('__')
      ? `${buyLinkBase}${buyLinkBase.includes('?') ? '&' : '?'}client_reference_id=${orgId ?? ''}`
      : null

  return (
    <main className="min-h-screen bg-stone-900 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="font-playfair text-3xl font-bold text-stone-100">Billing</h1>
          <a
            href="/dashboard"
            className="font-dmsans text-sm text-amber-600 underline min-h-[44px] inline-flex items-center px-2"
          >
            ← Dashboard
          </a>
        </header>

        <div className="bg-stone-50 rounded-lg p-6 mb-8">
          <div className="font-dmsans text-sm text-stone-900 mb-1">Current plan</div>
          <div className="font-playfair text-3xl font-bold text-stone-900 mb-2">
            {tier === 'paid' ? 'Paid · $19/month' : 'Free'}
          </div>
          <p className="font-dmsans text-sm text-stone-900">
            {tier === 'paid'
              ? 'Unlimited workers. Cancel anytime from your Stripe receipt.'
              : `${activeWorkers} / ${workerLimit ?? 5} workers tracked. Incident history is unlimited on every worker.`}
          </p>
        </div>

        {tier === 'free' && (
          <div className="bg-amber-600 rounded-lg p-6">
            <div className="font-playfair text-2xl font-bold text-stone-900 mb-2">
              Upgrade to track your whole roster
            </div>
            <div className="font-dmsans text-base text-stone-900 mb-4">
              $19 / month · 14-day free trial · cancel anytime
            </div>
            {buyLink ? (
              <a
                href={buyLink}
                className="font-dmsans text-base font-semibold text-amber-600 bg-stone-900 rounded-lg px-6 py-3 inline-block min-h-[44px]"
              >
                Start trial
              </a>
            ) : (
              <p className="font-dmsans text-sm text-stone-900">
                Stripe link not configured yet. Check back soon.
              </p>
            )}
          </div>
        )}
      </div>
    </main>
  )
}
