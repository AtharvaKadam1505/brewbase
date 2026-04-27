'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { saveUserProfile, checkUsernameAvailable } from '@/actions/user'
import { Loader2, Save, User, Link as LinkIcon, CheckCircle } from 'lucide-react'

export default function SettingsPage() {
  const { user: clerkUser } = useUser()
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [goalAmount, setGoalAmount] = useState('')
  const [goalLabel, setGoalLabel] = useState('')
  const [thankYouMsg, setThankYouMsg] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)
  const [available, setAvailable] = useState<boolean | null>(null)
  const [originalUsername, setOriginalUsername] = useState('')

  useEffect(() => {
    if (!clerkUser) return
    supabase
      .from('users')
      .select('username, bio, goal_amount, goal_label, thank_you_msg')
      .eq('clerk_id', clerkUser.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setUsername(data.username || '')
          setBio(data.bio || '')
          setOriginalUsername(data.username || '')
          setGoalAmount(data.goal_amount ? String(data.goal_amount / 100) : '')
          setGoalLabel(data.goal_label || '')
          setThankYouMsg(data.thank_you_msg || '')
        }
        setLoading(false)
      })
  }, [clerkUser])

  // Check availability when username changes (skip if unchanged)
  useEffect(() => {
    if (!username || username.length < 3) { setAvailable(null); return }
    if (username === originalUsername) { setAvailable(true); return }

    const timer = setTimeout(async () => {
      setChecking(true)
      const isAvailable = await checkUsernameAvailable(username)
      setAvailable(isAvailable)
      setChecking(false)
    }, 500)
    return () => clearTimeout(timer)
  }, [username, originalUsername])

  const handleSave = async () => {
    if (!clerkUser) return
    if (available === false) { setError('Username already taken.'); return }
    setError('')
    setSaving(true)

    try {
      await saveUserProfile({
        username,
        bio,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        avatarUrl: clerkUser.imageUrl || null,
        goalAmount:   goalAmount ? Math.round(parseFloat(goalAmount) * 100) : null,
        goalLabel:    goalLabel  || null,
        thankYouMsg:  thankYouMsg || null,
      })
      setOriginalUsername(username)
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="font-display text-3xl font-bold text-text-light mb-2">Settings</h1>
      <p className="text-text-muted mb-8">Manage your creator profile</p>

      <div className="card p-6 space-y-6">
        {/* Username */}
        <div>
          <label className="text-sm font-medium text-text-light mb-1.5 flex items-center gap-2">
            <User className="w-4 h-4 text-brand-primary" /> Username
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">
              brewbase.app/
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))
                setAvailable(null)
              }}
              className="input pl-28"
              placeholder="yourname"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {checking && <Loader2 className="w-4 h-4 text-text-muted animate-spin" />}
              {!checking && available === true && username !== originalUsername && (
                <CheckCircle className="w-4 h-4 text-green-500" />
              )}
              {!checking && available === false && (
                <span className="text-xs text-red-500 font-medium">Taken</span>
              )}
            </div>
          </div>
          <p className="text-xs text-text-muted mt-1">Only lowercase letters, numbers and underscores.</p>
        </div>

        {/* Bio */}
        <div>
          <label className="text-sm font-medium text-text-light mb-1.5 block">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="input resize-none h-28"
            placeholder="Tell your supporters about yourself..."
            maxLength={160}
          />
          <p className="text-xs text-text-muted mt-1 text-right">{bio.length}/160</p>
        </div>

        {/* Monthly Goal */}
        <div className="pt-2 border-t border-border-light">
          <p className="text-sm font-semibold text-text-light mb-4">Monthly Goal</p>
          <div className="space-y-3">
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5 block">
                Goal amount (₹)
              </label>
              <input
                type="number"
                value={goalAmount}
                onChange={(e) => setGoalAmount(e.target.value)}
                className="input"
                placeholder="e.g. 5000"
                min="0"
              />
              <p className="text-xs text-text-muted mt-1">Leave empty to hide the goal bar.</p>
            </div>
            <div>
              <label className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1.5 block">
                Goal label
              </label>
              <input
                type="text"
                value={goalLabel}
                onChange={(e) => setGoalLabel(e.target.value)}
                className="input"
                placeholder="e.g. Help me buy a new mic"
                maxLength={80}
              />
            </div>
          </div>
        </div>

        {/* Thank You Message */}
        <div className="pt-2 border-t border-border-light">
          <p className="text-sm font-semibold text-text-light mb-1">Thank you message</p>
          <p className="text-xs text-text-muted mb-3">Shown to supporters after a successful payment.</p>
          <textarea
            value={thankYouMsg}
            onChange={(e) => setThankYouMsg(e.target.value)}
            className="input resize-none h-24"
            placeholder="e.g. Thank you so much! This keeps me going ☕"
            maxLength={280}
          />
          <p className="text-xs text-text-muted mt-1 text-right">{thankYouMsg.length}/280</p>
        </div>

        {error && (
          <p className="text-sm text-red-500 bg-red-50 border border-red-100 rounded-xl px-4 py-2">
            {error}
          </p>
        )}
        {saved && (
          <p className="text-sm text-green-600 bg-green-50 border border-green-100 rounded-xl px-4 py-2">
            ✅ Profile saved successfully!
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={saving || available === false}
          className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4" /> Save changes</>
          )}
        </button>
      </div>

      {/* Profile link */}
      {username && (
        <div className="card p-4 mt-4 flex items-center gap-3">
          <LinkIcon className="w-4 h-4 text-brand-primary flex-shrink-0" />
          <span className="text-sm text-text-muted">Your public page:</span>
          <a
            href={`/${username}`}
            target="_blank"
            className="text-sm text-brand-primary hover:underline font-medium"
          >
            brewbase.app/{username}
          </a>
        </div>
      )}
    </div>
  )
}