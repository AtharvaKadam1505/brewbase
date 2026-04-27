import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const creatorId = searchParams.get('creatorId')

  if (!creatorId) {
    return NextResponse.json({ error: 'Missing creatorId' }, { status: 400 })
  }

  const now            = new Date()
  const startOfMonth   = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const { data, error } = await supabaseAdmin()
    .from('payments')
    .select('amount')
    .eq('creator_id', creatorId)
    .gte('created_at', startOfMonth)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const monthly_amount = (data || []).reduce((s, p) => s + p.amount, 0)

  return NextResponse.json({ monthly_amount })
}