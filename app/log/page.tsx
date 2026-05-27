'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '../../lib/supabase'

type Worker = { id: string; name: string; role: string | null; active: boolean }
type IncidentType = 'no_show' | 'late' | 'left_early'

const TYPES: { value: IncidentType; label: string; sub: string }[] = [
  { value: 'no_show', label: 'No-show', sub: "Didn't show up" },
  { value: 'late', label: 'Late', sub: 'Showed up late' },
  { value: 'left_early', label: 'Left early', sub: 'Walked off mid-shift' },
]

export default function LogPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [workers, setWorkers] = useState<Worker[]>([])
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [worker, setWorker] = useState<Worker | null>(null)
  const [type, setType] = useState<IncidentType | null>(null)
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

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
      const r = await fetch('/api/workers')
      const data = await r.json()
      if (cancelled) return
      setWorkers((data.workers || []).filter((w: Worker) => w.active))
      setLoading(false)
    })()
    return () => {
      cancelled = true
    }
  }, [router])

  async function save() {
    if (!worker || !type) return
    setSaving(true)
    setError('')
    const r = await fetch('/api/incidents', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        worker_id: worker.id,
        type,
        incident_date: date,
        note: note.trim() || undefined,
      }),
    })
    if (!r.ok) {
      const j = await r.json().catch(() => ({}))
      setError(j.error || 'Failed to save')
      setSaving(false)
      return
    }
    router.push('/dashboard')
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-stone-900 px-6 py-16">
        <p className="font-dmsans text-sm text-stone-300">Loading...</p>
      </main>
    )
  }

  if (workers.length === 0) {
    return (
      <main className="min-h-screen bg-stone-900 px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-playfair text-3xl font-bold text-stone-100 mb-4">Log incident</h1>
          <p className="font-dmsans text-base text-stone-300 mb-6">
            You need at least one active worker before you can log an incident.
          </p>
          <a
            href="/workers"
            className="font-dmsans text-sm font-semibold text-stone-900 bg-amber-600 rounded px-6 py-3 inline-block min-h-[44px]"
          >
            Add a worker
          </a>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-stone-900 px-6 py-12 pb-32">
      <div className="max-w-3xl mx-auto">
        <header className="mb-8 flex justify-between items-center">
          <h1 className="font-playfair text-3xl font-bold text-stone-100">Log incident</h1>
          <a
            href="/dashboard"
            className="font-dmsans text-sm text-amber-600 underline min-h-[44px] inline-flex items-center px-2"
          >
            ← Dashboard
          </a>
        </header>

        <ol className="flex gap-2 mb-8 font-dmsans text-xs text-stone-400">
          <li className={step >= 1 ? 'text-amber-600' : ''}>1. Worker</li>
          <li>·</li>
          <li className={step >= 2 ? 'text-amber-600' : ''}>2. Type</li>
          <li>·</li>
          <li className={step >= 3 ? 'text-amber-600' : ''}>3. Save</li>
        </ol>

        {step === 1 && (
          <div>
            <h2 className="font-playfair text-xl font-bold text-stone-100 mb-4">Pick a worker</h2>
            <ul className="space-y-2">
              {workers.map((w) => (
                <li key={w.id}>
                  <button
                    onClick={() => {
                      setWorker(w)
                      setStep(2)
                    }}
                    className="w-full text-left bg-stone-50 rounded-lg p-4 min-h-[44px]"
                  >
                    <div className="font-dmsans text-base font-semibold text-stone-900">{w.name}</div>
                    {w.role && <div className="font-dmsans text-sm text-stone-900">{w.role}</div>}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {step === 2 && worker && (
          <div>
            <p className="font-dmsans text-sm text-stone-400 mb-2">For {worker.name}</p>
            <h2 className="font-playfair text-xl font-bold text-stone-100 mb-4">What happened?</h2>
            <ul className="space-y-2">
              {TYPES.map((t) => (
                <li key={t.value}>
                  <button
                    onClick={() => {
                      setType(t.value)
                      setStep(3)
                    }}
                    className="w-full text-left bg-stone-50 rounded-lg p-4 min-h-[44px]"
                  >
                    <div className="font-dmsans text-base font-semibold text-stone-900">{t.label}</div>
                    <div className="font-dmsans text-sm text-stone-900">{t.sub}</div>
                  </button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setStep(1)}
              className="mt-6 font-dmsans text-sm text-amber-600 underline min-h-[44px] inline-flex items-center px-2"
            >
              ← Pick a different worker
            </button>
          </div>
        )}

        {step === 3 && worker && type && (
          <div>
            <p className="font-dmsans text-sm text-stone-400 mb-2">
              {worker.name} · {TYPES.find((t) => t.value === type)?.label}
            </p>
            <h2 className="font-playfair text-xl font-bold text-stone-100 mb-4">Save</h2>

            <label className="block font-dmsans text-sm font-medium text-stone-100 mb-2">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full font-dmsans text-sm text-stone-100 bg-white/5 border border-white/10 rounded px-4 py-3 mb-5 outline-none focus:border-amber-600 min-h-[44px]"
            />

            <label className="block font-dmsans text-sm font-medium text-stone-100 mb-2">
              Note (optional)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              placeholder="Anything to remember about this one"
              className="w-full font-dmsans text-sm text-stone-100 bg-white/5 border border-white/10 rounded px-4 py-3 outline-none focus:border-amber-600"
            />

            {error && (
              <p className="font-dmsans text-sm text-red-400 mt-4">{error}</p>
            )}

            <button
              onClick={() => setStep(2)}
              className="mt-6 font-dmsans text-sm text-amber-600 underline min-h-[44px] inline-flex items-center px-2"
            >
              ← Pick a different type
            </button>
          </div>
        )}
      </div>

      {step === 3 && (
        <div className="fixed bottom-0 left-0 right-0 bg-stone-900 border-t border-stone-800 px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={save}
              disabled={saving}
              className="w-full font-dmsans text-base font-semibold text-stone-900 bg-amber-600 disabled:bg-stone-600 rounded-lg py-4 min-h-[44px] disabled:cursor-not-allowed"
            >
              {saving ? 'Saving...' : 'Save incident'}
            </button>
          </div>
        </div>
      )}
    </main>
  )
}
