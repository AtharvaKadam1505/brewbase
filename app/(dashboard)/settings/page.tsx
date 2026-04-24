'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { Loader2, Save, User, Link as LinkIcon } from 'lucide-react'

export default function SettingsPage() {
  const { user: clerkUser } = useUser()
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!clerkUser) return
    supabase
      .from('users')
      .select('username, bio')
      .eq('clerk_id', clerkUser.id)
      .single()
      .then(({ data }) => {
        if (data) {
          setUsername(data.username || '')
          setBio(data.bio || '')
        }
        setLoading(false)
      })
  }, [clerkUser])

  const handleSave = async () => {
    if (!clerkUser) return
    setError('')
    setSaving(true)

    // Check username uniqueness
    if (username) {
      const { data: existing } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .neq('clerk_id', clerkUser.id)
        .single()

      if (existing) {
        setError('Username already taken. Please choose another.')
        setSaving(false)
        return
      }
    }

    const { error: updateError } = await supabase
      .from('users')
      .update({ username, bio })
      .eq('clerk_id', clerkUser.id)

    if (updateError) {
      setError('Failed to save. Please try again.')
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    }
    setSaving(false)
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
          <label className="text-sm font-medium text-text-light mb-1.5 block flex items-center gap-2">
            <User className="w-4 h-4 text-brand-primary" /> Username
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-sm">
              brewbase.app/
            </span>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
              className="input pl-28"
              placeholder="yourname"
            />
          </div>
          <p className="text-xs text-text-muted mt-1">Only lowercase letters, numbers and underscores.</p>
        </div>

        {/* Bio */}
        <div>
          <label className="text-sm font-medium text-text-light mb-1.5 block">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="input resize-none h-28"
            placeholder="Tell your supporters about yourself..."
            maxLength={160}
          />
          <p className="text-xs text-text-muted mt-1 text-right">{bio.length}/160</p>
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
          disabled={saving}
          className="btn-primary flex items-center gap-2"
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
