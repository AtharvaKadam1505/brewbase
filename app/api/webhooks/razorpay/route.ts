import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'

// Tell Next.js not to parse the body — we need raw text for signature verification
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    // Verify webhook signature using your Razorpay webhook secret
    // NOTE: This is the WEBHOOK secret from Razorpay Dashboard → Webhooks
    // It is different from your API key secret
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!

    const expectedSignature = createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')

    if (expectedSignature !== signature) {
      console.error('Razorpay webhook signature mismatch')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)

    // Only handle successful captured payments
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity
      const notes   = payment.notes || {}

      const creator_id  = notes.creator_id
      const user_id     = notes.user_id     || null
      const message     = notes.message     || null
      const is_anonymous = notes.is_anonymous === 'true'
      const show_amount  = notes.show_amount  !== 'false' // default true

      if (!creator_id) {
        console.error('No creator_id in payment notes')
        return NextResponse.json({ error: 'Missing creator_id' }, { status: 400 })
      }

      const { error } = await supabaseAdmin().from('payments').insert({
        creator_id,
        user_id:               user_id || null,
        amount:                payment.amount,     // already in paise
        message,
        is_anonymous,
        show_amount,
        stripe_payment_intent: payment.id,         // reusing this column for razorpay payment id
      })

      if (error) {
        console.error('Supabase insert error:', error.message)
        return NextResponse.json({ error: 'DB insert failed' }, { status: 500 })
      }

      console.log(`✅ Payment saved: ${payment.id} — ₹${payment.amount / 100}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}