'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { saveUserProfile, checkUsernameAvailable } from '@/actions/user'
import { Coffee, ArrowRight, Loader2, CheckCircle } from 'lucide-react'

export default function OnboardingPage() {
  const { user: clerkUser, isLoaded } = useUser()
  const router = useRouter()

  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  // Pre-fill from Clerk profile
  useEffect(() => {
    if (!clerkUser) return
    const suggested =
      clerkUser.username ||
      clerkUser.firstName?.toLowerCase().replace(/\s+/g, '') ||
      ''
    setUsername(suggested)
  }, [clerkUser])

  // Check availability with debounce
  useEffect(() => {
    if (!username || username.length < 3) { setAvailable(null); return }
    const timer = setTimeout(async () => {
      setChecking(true)
      const isAvailable = await checkUsernameAvailable(username)
      setAvailable(isAvailable)
      setChecking(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [username])

  const handleSubmit = async () => {
    if (!clerkUser || !username || !available) return
    setError('')
    setSaving(true)

    try {
      await saveUserProfile({
        username,
        bio,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        avatarUrl: clerkUser.imageUrl || null,
      })
      router.push('/dashboard')
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setSaving(false)
    }
  }

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-surface-light flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-light flex flex-col items-center justify-center px-4">
      <div className="flex items-center gap-2 mb-10">
        <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center">
          <Coffee className="w-5 h-5 text-white" />
        </div>
        <span className="font-display font-bold text-2xl text-text-light">BrewBase</span>
      </div>

      <div className="w-full max-w-md">
        <div className="card p-8">
          <div className="mb-6">
            <h1 className="font-display text-2xl font-bold text-text-light">
              Set up your creator page 🎉
            </h1>
            <p className="text-text-muted text-sm mt-1">
              Choose a username — this becomes your public page URL.
            </p>
          </div>

          {/* Username */}
          <div className="mb-4">
            <label className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5 block">
              Username
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm select-none">
                brewbase.app/
              </span>
              <input
                type="text"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                  setAvailable(null)
                }}
                className="input pl-[7.5rem]"
                placeholder="yourname"
                maxLength={30}
                autoFocus
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {checking && <Loader2 className="w-4 h-4 text-text-muted animate-spin" />}
                {!checking && available === true && <CheckCircle className="w-4 h-4 text-green-500" />}
                {!checking && available === false && (
                  <span className="text-xs text-red-500 font-medium">Taken</span>
                )}
              </div>
            </div>
            <p className="text-xs text-text-muted mt-1">
              Lowercase letters, numbers, underscores only. Min 3 characters.
            </p>
            {available === true && username.length >= 3 && (
              <p className="text-xs text-green-600 mt-1 font-medium">✓ Available!</p>
            )}
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5 block">
              Bio <span className="normal-case font-normal text-text-muted">(optional)</span>
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="input resize-none h-24"
              placeholder="Tell your supporters about yourself..."
              maxLength={160}
            />
            <p className="text-xs text-text-muted mt-1 text-right">{bio.length}/160</p>
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5 mb-4">
              {error}
            </p>
          )}

          <button
            onClick={handleSubmit}
            disabled={saving || !username || username.length < 3 || available !== true}
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Setting up your page...</>
            ) : (
              <>Create my page <ArrowRight className="w-4 h-4" /></>
            )}
          </button>
        </div>

        <p className="text-center text-xs text-text-muted mt-4">
          You can change your username anytime from Settings.
        </p>
      </div>
    </div>
  )
}