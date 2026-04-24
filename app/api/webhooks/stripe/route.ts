import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const signature = req.headers.get('x-razorpay-signature')!

  // Verify webhook signature
  const expectedSig = createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(JSON.stringify(body))
    .digest('hex')

  if (expectedSig !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  if (body.event === 'payment.captured') {
    const payment = body.payload.payment.entity
    const notes = payment.notes

    await supabaseAdmin().from('payments').insert({
      creator_id: notes.creator_id,
      user_id: notes.user_id || null,
      amount: payment.amount,
      message: notes.message || null,
      is_anonymous: notes.is_anonymous === 'true',
      show_amount: notes.show_amount === 'true',
      stripe_payment_intent: payment.id,  // reuse this column for razorpay payment id
    })
  }

  return NextResponse.json({ received: true })
}