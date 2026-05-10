'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

type Incident = {
  id: string
  worker_id: string
  worker_name: string | null
  incident_date: string
  type: string
  note: string | null
}

type Worker = { id: string; name: string; active: boolean }

const TYPE_LABEL: Record<string, string> = {
  no_show: 'No-show',
  late: 'Late',
  left_early: 'Left early',
}

export default function HistoryPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [incidents, setIncidents] = useState<Incident[]>([])
  const [workers, setWorkers] = useState<Worker[]>([])
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [workerId, setWorkerId] = useState('')

  async function refresh() {
    const params = new URLSearchParams()
    if (start) params.set('start', start)
    if (end) params.set('end', end)
    if (workerId) params.set('worker_id', workerId)
    const r = await fetch('/api/incidents?' + params.toString())
    const data = await r.json()
    setIncidents(data.incidents || [])
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
      const wr = await fetch('/api/workers')
      const wd = await wr.json()
      if (cancelled) return
      setWorkers(wd.workers || [])
      await refresh()
      if (!cancelled) setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  useEffect(() => {
    if (!loading) refresh()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start, end, workerId])

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-900 px-6 py-16">
        <p className="font-dmsans text-sm text-stone-300">Loading...</p>
      </main>
    )
  }

  const counts = incidents.reduce<Record<string, number>>((acc, i) => {
    const k = i.worker_name || 'unknown'
    acc[k] = (acc[k] || 0) + 1
    return acc
  }, {})
  const topCounts = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)

  return (
    <main className="min-h-screen bg-stone-900 px-6 py-12">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="font-playfair text-3xl font-bold text-stone-100">History</h1>
          <a
            href="/dashboard"
            className="font-dmsans text-sm text-amber-600 underline min-h-[44px] inline-flex items-center px-2"
          >
            ← Dashboard
          </a>
        </header>

        <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6 grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block font-dmsans text-xs text-stone-400 mb-1">From</label>
            <input
              type="date"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className="w-full font-dmsans text-sm text-stone-100 bg-white/5 border border-white/10 rounded px-3 py-2 outline-none focus:border-amber-600 min-h-[44px]"
            />
          </div>
          <div>
            <label className="block font-dmsans text-xs text-stone-400 mb-1">To</label>
            <input
              type="date"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className="w-full font-dmsans text-sm text-stone-100 bg-white/5 border border-white/10 rounded px-3 py-2 outline-none focus:border-amber-600 min-h-[44px]"
            />
          </div>
          <div>
            <label className="block font-dmsans text-xs text-stone-400 mb-1">Worker</label>
            <select
              value={workerId}
              onChange={(e) => setWorkerId(e.target.value)}
              className="w-full font-dmsans text-sm text-stone-100 bg-white/5 border border-white/10 rounded px-3 py-2 outline-none focus:border-amber-600 min-h-[44px]"
            >
              <option value="">All</option>
              {workers.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {topCounts.length > 0 && (
          <div className="bg-stone-50 rounded-lg p-4 mb-6">
            <h2 className="font-playfair text-base font-bold text-stone-900 mb-2">
              Counts in range
            </h2>
            <ul className="space-y-1">
              {topCounts.map(([name, n]) => (
                <li key={name} className="font-dmsans text-sm text-stone-900">
                  {name} — {n} {n === 1 ? 'incident' : 'incidents'}
                </li>
              ))}
            </ul>
          </div>
        )}

        {incidents.length === 0 ? (
          <p className="font-dmsans text-sm text-stone-400">No incidents in this range.</p>
        ) : (
          <ul className="space-y-2">
            {incidents.map((i) => (
              <li key={i.id} className="bg-stone-50 rounded-lg p-4">
                <div className="font-dmsans text-base font-semibold text-stone-900">
                  {i.worker_name || '(unknown)'}
                </div>
                <div className="font-dmsans text-sm text-stone-900">
                  {TYPE_LABEL[i.type] || i.type} · {i.incident_date}
                </div>
                {i.note && (
                  <div className="font-dmsans text-sm text-stone-900 mt-1">{i.note}</div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
