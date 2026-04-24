'use client'

import { useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { CheckCircle, XCircle, X } from 'lucide-react'

export default function PaymentToast() {
  const params = useSearchParams()
  const [show, setShow] = useState(false)
  const [type, setType] = useState<'success' | 'cancel'>('success')

  useEffect(() => {
    if (params.get('success')) { setType('success'); setShow(true) }
    if (params.get('canceled')) { setType('cancel'); setShow(true) }
    const t = setTimeout(() => setShow(false), 6000)
    return () => clearTimeout(t)
  }, [params])

  if (!show) return null

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-sm font-medium animate-fade-up ${
      type === 'success'
        ? 'bg-green-50 border border-green-200 text-green-700'
        : 'bg-red-50 border border-red-200 text-red-700'
    }`}>
      {type === 'success' ? (
        <><CheckCircle className="w-5 h-5" /> Payment successful! Thank you ☕</>
      ) : (
        <><XCircle className="w-5 h-5" /> Payment cancelled.</>
      )}
      <button onClick={() => setShow(false)} className="ml-2 opacity-60 hover:opacity-100">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}
