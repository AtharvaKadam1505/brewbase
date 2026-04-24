import { SignUp } from '@clerk/nextjs'
import { Coffee } from 'lucide-react'
import Link from 'next/link'

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-surface-light flex flex-col items-center justify-center px-4">
      <Link href="/" className="flex items-center gap-2 mb-8">
        <div className="w-9 h-9 rounded-xl bg-brand-primary flex items-center justify-center">
          <Coffee className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-bold text-2xl text-text-light">BrewBase</span>
      </Link>
      <SignUp forceRedirectUrl="/onboarding" />
    </div>
  )
}