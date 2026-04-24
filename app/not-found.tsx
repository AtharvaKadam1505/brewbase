import Link from 'next/link'
import { Coffee } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-light flex flex-col items-center justify-center px-4 text-center">
      <Coffee className="w-16 h-16 text-brand-primary mb-4 opacity-50" />
      <h1 className="font-display text-5xl font-bold text-text-light mb-3">404</h1>
      <p className="text-text-muted text-lg mb-8">This page doesn't exist or the creator hasn't set up their profile yet.</p>
      <Link href="/" className="btn-primary">Back to home</Link>
    </div>
  )
}
