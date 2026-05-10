import { NextResponse } from 'next/server'
import { getUserContext } from '../../../lib/supabase-server'
import { canLogIncident } from '../../../lib/entitlements'

type RawIncident = {
  id: string
  worker_id: string
  incident_date: string
  type: string
  note: string | null
  logged_by: string
  created_at: string
  workers: { name: string } | { name: string }[] | null
}

function normalize(rows: RawIncident[]) {
  return rows.map((r) => ({
    id: r.id,
    worker_id: r.worker_id,
    incident_date: r.incident_date,
    type: r.type,
    note: r.note,
    logged_by: r.logged_by,
    created_at: r.created_at,
    worker_name: Array.isArray(r.workers) ? r.workers[0]?.name ?? null : r.workers?.name ?? null,
  }))
}

export async function GET(request: Request) {
  const ctx = await getUserContext()
  if (!ctx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const url = new URL(request.url)
  const start = url.searchParams.get('start')
  const end = url.searchParams.get('end')
  const workerId = url.searchParams.get('worker_id')

  let q = ctx.supabase
    .from('incidents')
    .select('id, worker_id, incident_date, type, note, logged_by, created_at, workers(name)')
    .order('incident_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(500)
  if (start) q = q.gte('incident_date', start)
  if (end) q = q.lte('incident_date', end)
  if (workerId) q = q.eq('worker_id', workerId)
  const { data, error } = await q
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ incidents: normalize((data ?? []) as RawIncident[]) })
}

export async function POST(request: Request) {
  const ctx = await getUserContext()
  if (!ctx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body?.worker_id || !body?.type || !body?.incident_date) {
    return NextResponse.json(
      { error: 'worker_id, type, incident_date required' },
      { status: 400 }
    )
  }
  if (!['no_show', 'late', 'left_early'].includes(body.type)) {
    return NextResponse.json({ error: 'invalid type' }, { status: 400 })
  }

  const gate = await canLogIncident(ctx.profile.org_id)
  if (!gate.ok) {
    return NextResponse.json(
      {
        error: 'free_tier_limit',
        used: gate.used,
        limit: gate.limit,
        upgradeUrl: gate.upgradeUrl,
      },
      { status: 402 }
    )
  }

  const { data, error } = await ctx.supabase
    .from('incidents')
    .insert({
      org_id: ctx.profile.org_id,
      worker_id: body.worker_id,
      incident_date: body.incident_date,
      type: body.type,
      note: typeof body.note === 'string' && body.note.trim() ? body.note.trim() : null,
      logged_by: ctx.user.id,
    })
    .select('id, worker_id, incident_date, type, note, created_at')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({
    incident: data,
    used: gate.used + 1,
    limit: gate.limit,
    tier: gate.tier,
  })
}
