'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

// NOTE (SPEC-0026): the cap lock below is driven by the SERVER's cap state returned
// from GET /api/workers ({ limit, atLimit }), NOT a client-side subscription_tier read.
// lib/useEntitlements() stays intentionally UNCONSUMED — it is the forward-compat seam
// for the SPEC-0015 Phase 5 unlocks layer; wiring it to UI is deferred pending RLS
// verification on client-side tier reads.

type Worker = {
  id: string
  name: string
  role: string | null
  active: boolean
  created_at: string
}

export default function WorkersPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [workers, setWorkers] = useState<Worker[]>([])
  const [limit, setLimit] = useState<number | null>(null)
  const [atLimit, setAtLimit] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function refresh() {
    const r = await fetch('/api/workers')
    const data = await r.json()
    setWorkers(data.workers || [])
    setLimit(data.limit ?? null)
    setAtLimit(Boolean(data.atLimit))
  }

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
      await refresh()
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  async function addWorker(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    setSubmitting(true)
    setError('')
    const r = await fetch('/api/workers', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ name: name.trim(), role: role.trim() || undefined }),
    })
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      // Backstop: server gate rejected — surface the same lock/CTA, not a raw error.
      if (r.status === 403 && j.error === 'free_limit_reached') {
        setAtLimit(true)
        if (typeof j.limit === 'number') setLimit(j.limit)
        setSubmitting(false)
        return
      }
      setError(j.error || 'Failed to add worker')
      setSubmitting(false)
      return
    }
    setName('')
    setRole('')
    await refresh()
    setSubmitting(false)
  }

  async function toggleActive(w: Worker) {
    const r = await fetch(`/api/workers/${w.id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ active: !w.active }),
    })
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      // SPEC-0026: PATCH reactivation can hit the worker cap. Mirror the addWorker
      // backstop — surface the lock state instead of a silent failure.
      if (r.status === 403 && j.error === 'free_limit_reached') {
        setAtLimit(true)
        if (typeof j.limit === 'number') setLimit(j.limit)
      }
    }
    await refresh()
  }

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
        <header className="mb-10 flex justify-between items-center">
          <h1 className="font-playfair text-3xl font-bold text-stone-100">Workers</h1>
          <a
            href="/dashboard"
            className="font-dmsans text-sm text-amber-600 underline min-h-[44px] inline-flex items-center px-2"
          >
            ← Dashboard
          </a>
        </header>

        {atLimit ? (
          <div className="bg-amber-600 rounded-lg p-6 mb-10">
            <div className="font-playfair text-2xl font-bold text-stone-900 mb-2">
              Free limit reached
            </div>
            <div className="font-dmsans text-base text-stone-900 mb-4">
              You&apos;re tracking the maximum of {limit ?? 5} workers on the free plan.
              Upgrade to add your whole roster — incident history on your current workers
              stays unlimited.
            </div>
            <a
              href="/billing"
              className="font-dmsans text-base font-semibold text-amber-600 bg-stone-900 rounded-lg px-6 py-3 inline-block min-h-[44px]"
            >
              Upgrade to add more →
            </a>
          </div>
        ) : (
          <form
            onSubmit={addWorker}
            className="bg-white/5 border border-white/10 rounded-lg p-6 mb-10"
          >
            <h2 className="font-playfair text-lg font-bold text-stone-100 mb-4">Add worker</h2>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Name"
                className="flex-1 font-dmsans text-sm text-stone-100 bg-white/5 border border-white/10 rounded px-4 py-3 outline-none focus:border-amber-600 min-h-[44px]"
              />
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Role (optional)"
                className="flex-1 font-dmsans text-sm text-stone-100 bg-white/5 border border-white/10 rounded px-4 py-3 outline-none focus:border-amber-600 min-h-[44px]"
              />
              <button
                type="submit"
                disabled={submitting || !name.trim()}
                className="font-dmsans text-sm font-semibold text-stone-900 bg-amber-600 disabled:bg-stone-600 rounded px-6 py-3 min-h-[44px] disabled:cursor-not-allowed"
              >
                {submitting ? 'Adding...' : 'Add'}
              </button>
            </div>
            {error && <p className="font-dmsans text-sm text-red-400 mt-3">{error}</p>}
          </form>
        )}

        {workers.length === 0 ? (
          <p className="font-dmsans text-sm text-stone-400">No workers yet. Add one above.</p>
        ) : (
          <ul className="space-y-2">
            {workers.map((w) => (
              <li
                key={w.id}
                className={`rounded-lg p-4 flex justify-between items-center ${
                  w.active ? 'bg-stone-50' : 'bg-stone-50/50'
                }`}
              >
                <div>
                  <div
                    className={`font-dmsans text-base font-semibold ${
                      w.active ? 'text-stone-900' : 'text-stone-700 line-through'
                    }`}
                  >
                    {w.name}
                  </div>
                  {w.role && <div className="font-dmsans text-sm text-stone-700">{w.role}</div>}
                </div>
                <button
                  onClick={() => toggleActive(w)}
                  className="font-dmsans text-sm font-semibold text-stone-900 bg-stone-200 rounded px-4 py-2 min-h-[44px]"
                >
                  {w.active ? 'Deactivate' : 'Activate'}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
