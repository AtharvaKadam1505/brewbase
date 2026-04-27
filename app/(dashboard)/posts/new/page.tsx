'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Loader2, Globe, Lock, Eye } from 'lucide-react'
import Link from 'next/link'

export default function NewPostPage() {
  const { user: clerkUser } = useUser()
  const router = useRouter()

  const [title, setTitle]         = useState('')
  const [content, setContent]     = useState('')
  const [isPublic, setIsPublic]   = useState(true)
  const [preview, setPreview]     = useState(false)
  const [saving, setSaving]       = useState(false)
  const [error, setError]         = useState('')

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.')
      return
    }
    if (!clerkUser) return

    setSaving(true)
    setError('')

    try {
      // Get creator's Supabase id
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('clerk_id', clerkUser.id)
        .single()

      if (!user) throw new Error('User not found')

      const { error: insertError } = await supabase.from('posts').insert({
        creator_id: user.id,
        title:      title.trim(),
        content:    content.trim(),
        is_public:  isPublic,
      })

      if (insertError) throw new Error(insertError.message)

      router.push('/dashboard/posts')
    } catch (err: any) {
      setError(err.message || 'Failed to save post.')
      setSaving(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/posts" className="p-2 rounded-xl hover:bg-orange-100 transition-colors">
          <ArrowLeft className="w-5 h-5 text-text-muted" />
        </Link>
        <h1 className="font-display text-2xl font-bold text-text-light">New post</h1>
      </div>

      <div className="space-y-5">
        {/* Title */}
        <div>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input text-lg font-medium"
            placeholder="Post title..."
            maxLength={120}
          />
          <p className="text-xs text-text-muted mt-1 text-right">{title.length}/120</p>
        </div>

        {/* Content */}
        <div className="card overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border-light bg-surface-light">
            <button
              onClick={() => setPreview(false)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                !preview ? 'bg-brand-primary text-white' : 'text-text-muted hover:text-text-light'
              }`}
            >
              Write
            </button>
            <button
              onClick={() => setPreview(true)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                preview ? 'bg-brand-primary text-white' : 'text-text-muted hover:text-text-light'
              }`}
            >
              <Eye className="w-3 h-3" /> Preview
            </button>
            <span className="ml-auto text-xs text-text-muted">{content.length} chars</span>
          </div>

          {preview ? (
            <div
              className="p-5 min-h-[300px] prose prose-sm max-w-none text-text-light"
              style={{ whiteSpace: 'pre-wrap', lineHeight: '1.7' }}
            >
              {content || <span className="text-text-muted italic">Nothing to preview yet...</span>}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-5 min-h-[300px] bg-transparent resize-none text-text-light placeholder:text-text-muted focus:outline-none text-sm leading-relaxed"
              placeholder="Write your post here... Share an update, a story, or exclusive content for your supporters."
            />
          )}
        </div>

        {/* Visibility toggle */}
        <div className="card p-4">
          <p className="text-sm font-medium text-text-light mb-3">Visibility</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsPublic(true)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                isPublic
                  ? 'border-brand-primary bg-orange-50'
                  : 'border-border-light hover:border-brand-primary/50'
              }`}
            >
              <Globe className={`w-5 h-5 ${isPublic ? 'text-brand-primary' : 'text-text-muted'}`} />
              <div className="text-left">
                <p className={`text-sm font-medium ${isPublic ? 'text-brand-primary' : 'text-text-light'}`}>
                  Public
                </p>
                <p className="text-xs text-text-muted">Visible to everyone</p>
              </div>
            </button>

            <button
              onClick={() => setIsPublic(false)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                !isPublic
                  ? 'border-brand-primary bg-orange-50'
                  : 'border-border-light hover:border-brand-primary/50'
              }`}
            >
              <Lock className={`w-5 h-5 ${!isPublic ? 'text-brand-primary' : 'text-text-muted'}`} />
              <div className="text-left">
                <p className={`text-sm font-medium ${!isPublic ? 'text-brand-primary' : 'text-text-light'}`}>
                  Supporters only
                </p>
                <p className="text-xs text-text-muted">Only people who tipped</p>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">
            {error}
          </p>
        )}

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !content.trim()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Publishing...</>
            ) : (
              'Publish post'
            )}
          </button>
          <Link href="/dashboard/posts" className="btn-ghost text-sm">
            Cancel
          </Link>
        </div>
      </div>
    </div>
  )
}