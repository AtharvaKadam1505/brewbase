'use client'

import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'
import { UserButton } from '@clerk/nextjs'
import { Coffee } from 'lucide-react'

export default function NavBar() {
  const { isSignedIn, isLoaded } = useAuth()

  return (
    <nav className="fixed top-0 inset-x-0 z-50 bg-surface-light/80 backdrop-blur-md border-b border-border-light">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-brand-primary flex items-center justify-center">
            <Coffee className="w-4 h-4 text-white" />
          </div>
          <span className="font-display font-bold text-xl text-text-light">BrewBase</span>
        </Link>

        <div className="flex items-center gap-3">
          {!isLoaded ? (
            /* Skeleton while Clerk loads */
            <div className="w-24 h-9 rounded-xl bg-border-light animate-pulse" />
          ) : isSignedIn ? (
            <>
              <Link href="/dashboard" className="btn-primary text-sm">Dashboard</Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link href="/sign-in" className="btn-ghost text-sm">Sign in</Link>
              <Link href="/sign-up" className="btn-primary text-sm">Get started</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}