import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { razorpay } from '@/lib/razorpay'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { userId } = await auth()
    const { amount, creatorId, message, isAnonymous, showAmount } = await req.json()

    if (!amount || !creatorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Get creator info
    const { data: creator } = await supabaseAdmin()
      .from('users')
      .select('username')
      .eq('id', creatorId)
      .single()

    if (!creator) {
      return NextResponse.json({ error: 'Creator not found' }, { status: 404 })
    }

    // Get supporter's Supabase user id if logged in
    let supporterDbId = ''
    if (userId) {
      const { data: supporter } = await supabaseAdmin()
        .from('users')
        .select('id')
        .eq('clerk_id', userId)
        .single()
      supporterDbId = supporter?.id || ''
    }

    // Create Razorpay order — notes are passed to webhook
    const order = await razorpay.orders.create({
      amount,           // in paise e.g. 9900 = ₹99
      currency: 'INR',
      notes: {
        creator_id:  creatorId,
        user_id:     supporterDbId,
        message:     message    || '',
        is_anonymous: String(isAnonymous),
        show_amount:  String(showAmount),
      },
    })

    return NextResponse.json({
      orderId: order.id,
      amount:  order.amount,
    })
  } catch (err: any) {
    console.error('Checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}