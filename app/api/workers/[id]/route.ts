import { NextResponse } from 'next/server'
import { getUserContext } from '../../../../lib/supabase-server'

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const ctx = await getUserContext()
  if (!ctx) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const body = await request.json().catch(() => null)
  if (!body) return NextResponse.json({ error: 'body required' }, { status: 400 })
  const updates: Record<string, unknown> = {}
  if (typeof body.name === 'string') updates.name = body.name.trim()
  if (typeof body.role === 'string') updates.role = body.role.trim() || null
  if (typeof body.active === 'boolean') updates.active = body.active
  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: 'no updatable fields' }, { status: 400 })
  }
  const { data, error } = await ctx.supabase
    .from('workers')
    .update(updates)
    .eq('id', params.id)
    .select('id, name, role, active')
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ worker: data })
}
