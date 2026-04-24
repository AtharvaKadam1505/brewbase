import { NextRequest, NextResponse } from 'next/server'
import { razorpay } from '@/lib/razorpay'

export async function POST(req: NextRequest) {
  const { amount, creatorId, message, isAnonymous, showAmount } = await req.json()

  const order = await razorpay.orders.create({
    amount,           // in paise, e.g. 9900 = ₹99
    currency: 'INR',
    notes: {
      creator_id: creatorId,
      message: message || '',
      is_anonymous: String(isAnonymous),
      show_amount: String(showAmount),
    },
  })

  return NextResponse.json({ orderId: order.id, amount: order.amount })
}