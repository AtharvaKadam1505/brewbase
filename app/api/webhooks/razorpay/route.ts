import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { supabaseAdmin } from '@/lib/supabase'
import { resend } from '@/lib/resend'
import { supporterEmailHtml, creatorEmailHtml } from '@/lib/email-templates'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  try {
    const body      = await req.text()
    const signature = req.headers.get('x-razorpay-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    const expectedSignature = createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')

    if (expectedSignature !== signature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)

    if (event.event === 'payment.captured') {
      const payment     = event.payload.payment.entity
      const notes       = payment.notes || {}
      const creator_id  = notes.creator_id
      const user_id     = notes.user_id || null
      const message     = notes.message || null
      const is_anonymous = notes.is_anonymous === 'true'
      const show_amount  = notes.show_amount !== 'false'

      if (!creator_id) {
        return NextResponse.json({ error: 'Missing creator_id' }, { status: 400 })
      }

      const supabase = supabaseAdmin()

      // ── 1. Save payment to Supabase ──────────────────────────────────────
      const { error: insertError } = await supabase.from('payments').insert({
        creator_id,
        user_id,
        amount:                payment.amount,
        message,
        is_anonymous,
        show_amount,
        stripe_payment_intent: payment.id,
      })

      if (insertError) {
        console.error('Supabase insert error:', insertError.message)
        return NextResponse.json({ error: 'DB insert failed' }, { status: 500 })
      }

      // ── 2. Fetch creator + supporter details for emails ───────────────────
      const { data: creator } = await supabase
        .from('users')
        .select('username, email, thank_you_msg')
        .eq('id', creator_id)
        .single()

      let supporterEmail: string | null  = null
      let supporterName:  string         = 'Anonymous'

      if (user_id) {
        const { data: supporter } = await supabase
          .from('users')
          .select('username, email')
          .eq('id', user_id)
          .single()
        if (supporter) {
          supporterEmail = supporter.email
          supporterName  = supporter.username
        }
      }

      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourapp.vercel.app'

      // ── 3. Send thank-you email to supporter ─────────────────────────────
      if (supporterEmail && !is_anonymous) {
        await resend.emails.send({
          from:    'BrewBase <noreply@yourdomain.com>',
          to:      supporterEmail,
          subject: `Thanks for supporting ${creator?.username} ☕`,
          html:    supporterEmailHtml({
            supporterName,
            creatorName:  creator?.username  || 'the creator',
            amount:       payment.amount,
            message,
            thankYouMsg:  creator?.thank_you_msg || null,
            profileUrl:   `${appUrl}/${creator?.username}`,
          }),
        }).catch(e => console.error('Supporter email error:', e))
      }

      // ── 4. Notify creator ─────────────────────────────────────────────────
      if (creator?.email) {
        await resend.emails.send({
          from:    'BrewBase <noreply@yourdomain.com>',
          to:      creator.email,
          subject: `You just received ${is_anonymous ? 'an anonymous tip' : `a tip from ${supporterName}`} 🎉`,
          html:    creatorEmailHtml({
            creatorName:   creator.username,
            supporterName: is_anonymous ? 'Someone' : supporterName,
            amount:        payment.amount,
            message,
            dashboardUrl:  `${appUrl}/dashboard`,
          }),
        }).catch(e => console.error('Creator email error:', e))
      }

      console.log(`✅ Payment saved + emails sent: ${payment.id} ₹${payment.amount / 100}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Webhook error:', err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}