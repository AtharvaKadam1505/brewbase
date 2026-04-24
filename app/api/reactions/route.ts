import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'

const ALLOWED_EMOJIS = ['☕', '❤️', '🔥', '🎉', '👏', '💛']

export async function POST(req: NextRequest) {
  try {
    const { payment_id, emoji } = await req.json()

    if (!payment_id || !emoji || !ALLOWED_EMOJIS.includes(emoji)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    // Use IP for anonymous rate-limiting (no login required to react)
    const forwarded = req.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : 'unknown'

    const supabase = supabaseAdmin()

    // Check if this IP already reacted with this emoji on this payment
    const { data: existing } = await supabase
      .from('reactions')
      .select('id')
      .eq('payment_id', payment_id)
      .eq('emoji', emoji)
      .eq('user_ip', ip)
      .single()

    if (existing) {
      // Toggle OFF — remove reaction
      await supabase.from('reactions').delete().eq('id', existing.id)
      return NextResponse.json({ action: 'removed' })
    }

    // Toggle ON — add reaction
    await supabase.from('reactions').insert({ payment_id, emoji, user_ip: ip })
    return NextResponse.json({ action: 'added' })
  } catch (err: any) {
    console.error('Reaction error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const payment_id = searchParams.get('payment_id')

  if (!payment_id) {
    return NextResponse.json({ error: 'Missing payment_id' }, { status: 400 })
  }

  const { data } = await supabaseAdmin()
    .from('reactions')
    .select('emoji')
    .eq('payment_id', payment_id)

  // Aggregate counts
  const counts: Record<string, number> = {}
  for (const row of data || []) {
    counts[row.emoji] = (counts[row.emoji] || 0) + 1
  }

  return NextResponse.json({ reactions: counts })
}
