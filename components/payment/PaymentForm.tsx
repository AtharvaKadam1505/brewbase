'use client'

import { useState, useEffect } from 'react'
import { Coffee, Heart, Loader2, ShieldCheck } from 'lucide-react'

declare global {
  interface Window {
    Razorpay: any
  }
}

const AMOUNTS = [99, 199, 499, 999]

interface PaymentFormProps {
  creatorId: string
  creatorName: string
}

function useRazorpayScript() {
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    if (window.Razorpay) { setLoaded(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setLoaded(true)
    script.onerror = () => console.error('Failed to load Razorpay script')
    document.body.appendChild(script)
    return () => { if (document.body.contains(script)) document.body.removeChild(script) }
  }, [])

  return loaded
}

export default function PaymentForm({ creatorId, creatorName }: PaymentFormProps) {
  const [amount, setAmount] = useState(99)
  const [customAmount, setCustomAmount] = useState('')
  const [message, setMessage] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [showAmount, setShowAmount] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const razorpayReady = useRazorpayScript()
  const finalAmount = customAmount ? parseInt(customAmount) : amount

  const handleSupport = async () => {
    if (!finalAmount || finalAmount < 10) return
    if (!razorpayReady) { setError('Payment system is loading. Please try again.'); return }

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: finalAmount * 100, creatorId, message, isAnonymous, showAmount }),
      })

      if (!res.ok) throw new Error('Failed to create order. Please try again.')

      const { orderId, amount: orderAmount } = await res.json()

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderAmount,
        currency: 'INR',
        order_id: orderId,
        name: 'BrewBase',
        description: `Support ${creatorName} ☕`,
        image: '/logo.png',
        theme: { color: '#F97316' },
        prefill: { name: '', email: '', contact: '' },
        modal: {
          ondismiss: () => setLoading(false),
        },
        handler: (_response: {
          razorpay_payment_id: string
          razorpay_order_id: string
          razorpay_signature: string
        }) => {
          window.location.href = `/${creatorName}?success=1`
        },
      }

      const rzp = new window.Razorpay(options)
      rzp.on('payment.failed', (response: { error: { description: string } }) => {
        setError(response.error?.description || 'Payment failed. Please try again.')
        setLoading(false)
      })
      rzp.open()

    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="card p-6 space-y-5">
      <div className="text-center">
        <div className="w-14 h-14 rounded-2xl bg-orange-100 flex items-center justify-center mx-auto mb-3">
          <Coffee className="w-7 h-7 text-brand-primary" />
        </div>
        <h3 className="font-display text-xl font-bold text-text-light">Support {creatorName}</h3>
        <p className="text-sm text-text-muted mt-1">Buy them a coffee ☕</p>
      </div>

      <div>
        <label className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2 block">
          Choose amount (₹)
        </label>
        <div className="grid grid-cols-4 gap-2">
          {AMOUNTS.map((a) => (
            <button
              key={a}
              onClick={() => { setAmount(a); setCustomAmount('') }}
              className={`py-2.5 rounded-xl text-sm font-medium border transition-all duration-200 ${
                amount === a && !customAmount
                  ? 'bg-brand-primary text-white border-brand-primary'
                  : 'bg-white dark:bg-surface-darkcard border-border-light text-text-light hover:border-brand-primary'
              }`}
            >
              ₹{a}
            </button>
          ))}
        </div>
        <input
          type="number"
          placeholder="Or enter custom amount"
          value={customAmount}
          onChange={(e) => setCustomAmount(e.target.value)}
          className="input mt-2"
          min="10"
        />
        {customAmount && parseInt(customAmount) < 10 && (
          <p className="text-xs text-red-500 mt-1">Minimum amount is ₹10</p>
        )}
      </div>

      <div>
        <label className="text-xs font-medium text-text-muted uppercase tracking-wide mb-2 block">
          Leave a message (optional)
        </label>
        <textarea
          placeholder="Say something kind..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="input resize-none h-24"
          maxLength={280}
        />
        <p className="text-xs text-text-muted mt-1 text-right">{message.length}/280</p>
      </div>

      <div className="space-y-2">
        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`w-10 h-5 rounded-full transition-colors duration-200 flex items-center flex-shrink-0 cursor-pointer ${
              isAnonymous ? 'bg-brand-primary' : 'bg-gray-200'
            }`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 mx-0.5 ${
              isAnonymous ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </div>
          <span className="text-sm text-text-light">Stay anonymous</span>
        </label>

        <label className="flex items-center gap-3 cursor-pointer">
          <div
            onClick={() => setShowAmount(!showAmount)}
            className={`w-10 h-5 rounded-full transition-colors duration-200 flex items-center flex-shrink-0 cursor-pointer ${
              showAmount ? 'bg-brand-primary' : 'bg-gray-200'
            }`}
          >
            <div className={`w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 mx-0.5 ${
              showAmount ? 'translate-x-5' : 'translate-x-0'
            }`} />
          </div>
          <span className="text-sm text-text-light">Show amount publicly</span>
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
          {error}
        </p>
      )}

      <button
        onClick={handleSupport}
        disabled={loading || !finalAmount || finalAmount < 10 || !razorpayReady}
        className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <><Loader2 className="w-4 h-4 animate-spin" /> Opening payment...</>
        ) : (
          <><Heart className="w-4 h-4" /> Support ₹{finalAmount || '—'}</>
        )}
      </button>

      <p className="text-xs text-center text-text-muted flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-green-500" />
        Secured by Razorpay · UPI, Cards, Net Banking accepted
      </p>
    </div>
  )
}
