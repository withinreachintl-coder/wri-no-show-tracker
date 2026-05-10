import { NextResponse } from 'next/server'
import { getUserContext } from '../../../lib/supabase-server'

export async function GET() {
  const ctx = await getUserContext()
  if (!ctx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const { data, error } = await ctx.supabase
    .from('workers')
    .select('id, name, role, active, created_at')
    .order('active', { ascending: false })
    .order('name')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ workers: data ?? [] })
}

export async function POST(request: Request) {
  const ctx = await getUserContext()
  if (!ctx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  const name = typeof body?.name === 'string' ? body.name.trim() : ''
  if (!name) return NextResponse.json({ error: 'name required' }, { status: 400 })
  const role =
    typeof body?.role === 'string' && body.role.trim().length > 0 ? body.role.trim() : null
  const { data, error } = await ctx.supabase
    .from('workers')
    .insert({ org_id: ctx.profile.org_id, name, role })
    .select('id, name, role, active, created_at')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ worker: data })
}
