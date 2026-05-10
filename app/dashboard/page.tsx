'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

type Incident = {
  id: string
  worker_id: string
  incident_date: string
  type: string
  note: string | null
  worker_name: string | null
}

const TYPE_LABEL: Record<string, string> = {
  no_show: 'No-show',
  late: 'Late',
  left_early: 'Left early',
}

export default function Dashboard() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [orgName, setOrgName] = useState('')
  const [used, setUsed] = useState(0)
  const [tier, setTier] = useState<'free' | 'paid'>('free')

  useEffect(() => {
    let cancelled = false
    async function load() {
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
      const orgId = profile?.org_id
      if (orgId) {
        const { data: org } = await supabase
          .from('organizations')
          .select('name, subscription_tier')
          .eq('id', orgId)
          .single()
        if (cancelled) return
        setOrgName(org?.name || 'My Business')
        setTier(org?.subscription_tier === 'paid' ? 'paid' : 'free')
      }
      const r = await fetch('/api/incidents?start=1970-01-01')
      const data = await r.json()
      if (cancelled) return
      const all: Incident[] = data.incidents || []
      setIncidents(all.slice(0, 5))
      setUsed(all.length)
      setLoading(false)
    }
    load()
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

  return (
    <main className="min-h-screen bg-stone-900 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <header className="flex justify-between items-center mb-10 flex-wrap gap-3">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-stone-100">{orgName}</h1>
            <p className="font-dmsans text-sm text-stone-400">
              {tier === 'paid' ? 'Paid plan · unlimited' : `Free plan · ${used} / 10 logged`}
            </p>
          </div>
          <a
            href="/billing"
            className="font-dmsans text-sm text-amber-600 underline min-h-[44px] inline-flex items-center px-2"
          >
            Billing
          </a>
        </header>

        <a
          href="/log"
          className="block w-full font-dmsans text-base font-semibold text-stone-900 bg-amber-600 rounded-lg py-6 text-center mb-10 min-h-[44px]"
        >
          Log incident
        </a>

        <div className="mb-4 flex justify-between items-baseline">
          <h2 className="font-playfair text-xl font-bold text-stone-100">Recent</h2>
          <a
            href="/history"
            className="font-dmsans text-sm text-amber-600 underline min-h-[44px] inline-flex items-center px-2"
          >
            All history
          </a>
        </div>

        {incidents.length === 0 ? (
          <p className="font-dmsans text-sm text-stone-400">No incidents logged yet. Tap above to start.</p>
        ) : (
          <ul className="space-y-2">
            {incidents.map((i) => (
              <li key={i.id} className="bg-stone-50 rounded-lg p-4">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="font-dmsans text-base font-semibold text-stone-900">
                      {i.worker_name || '(unknown)'}
                    </div>
                    <div className="font-dmsans text-sm text-stone-900">
                      {TYPE_LABEL[i.type] || i.type} · {i.incident_date}
                    </div>
                    {i.note && (
                      <div className="font-dmsans text-sm text-stone-900 mt-1">{i.note}</div>
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <nav className="mt-12 flex gap-x-6 gap-y-2 flex-wrap">
          <a
            href="/workers"
            className="font-dmsans text-sm text-amber-600 underline min-h-[44px] inline-flex items-center px-2"
          >
            Workers
          </a>
          <a
            href="/history"
            className="font-dmsans text-sm text-amber-600 underline min-h-[44px] inline-flex items-center px-2"
          >
            History
          </a>
        </nav>
      </div>
    </main>
  )
}
