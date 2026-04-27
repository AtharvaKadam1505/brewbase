'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useUser } from '@clerk/nextjs'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Loader2, Globe, Lock, Trash2, Eye } from 'lucide-react'
import Link from 'next/link'

export default function EditPostPage() {
  const { user: clerkUser } = useUser()
  const router  = useRouter()
  const params  = useParams()
  const postId  = params.id as string

  const [title, setTitle]       = useState('')
  const [content, setContent]   = useState('')
  const [isPublic, setIsPublic] = useState(true)
  const [preview, setPreview]   = useState(false)
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError]       = useState('')

  useEffect(() => {
    if (!postId) return
    supabase
      .from('posts')
      .select('*')
      .eq('id', postId)
      .single()
      .then(({ data }) => {
        if (data) {
          setTitle(data.title)
          setContent(data.content)
          setIsPublic(data.is_public)
        }
        setLoading(false)
      })
  }, [postId])

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      setError('Title and content are required.')
      return
    }
    setSaving(true)
    setError('')

    const { error: updateError } = await supabase
      .from('posts')
      .update({ title: title.trim(), content: content.trim(), is_public: isPublic, updated_at: new Date().toISOString() })
      .eq('id', postId)

    if (updateError) {
      setError(updateError.message)
      setSaving(false)
    } else {
      router.push('/dashboard/posts')
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    setDeleting(true)
    await supabase.from('posts').delete().eq('id', postId)
    router.push('/dashboard/posts')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <Link href="/dashboard/posts" className="p-2 rounded-xl hover:bg-orange-100 transition-colors">
            <ArrowLeft className="w-5 h-5 text-text-muted" />
          </Link>
          <h1 className="font-display text-2xl font-bold text-text-light">Edit post</h1>
        </div>
        <button
          onClick={handleDelete}
          disabled={deleting}
          className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          {deleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>

      <div className="space-y-5">
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

        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-2 border-b border-border-light bg-surface-light">
            <button
              onClick={() => setPreview(false)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors ${
                !preview ? 'bg-brand-primary text-white' : 'text-text-muted hover:text-text-light'
              }`}
            >Write</button>
            <button
              onClick={() => setPreview(true)}
              className={`text-xs px-3 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                preview ? 'bg-brand-primary text-white' : 'text-text-muted hover:text-text-light'
              }`}
            >
              <Eye className="w-3 h-3" /> Preview
            </button>
          </div>

          {preview ? (
            <div className="p-5 min-h-[300px] text-text-light text-sm leading-relaxed" style={{ whiteSpace: 'pre-wrap' }}>
              {content || <span className="text-text-muted italic">Nothing to preview yet...</span>}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-5 min-h-[300px] bg-transparent resize-none text-text-light placeholder:text-text-muted focus:outline-none text-sm leading-relaxed"
              placeholder="Write your post here..."
            />
          )}
        </div>

        <div className="card p-4">
          <p className="text-sm font-medium text-text-light mb-3">Visibility</p>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setIsPublic(true)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                isPublic ? 'border-brand-primary bg-orange-50' : 'border-border-light hover:border-brand-primary/50'
              }`}
            >
              <Globe className={`w-5 h-5 ${isPublic ? 'text-brand-primary' : 'text-text-muted'}`} />
              <div className="text-left">
                <p className={`text-sm font-medium ${isPublic ? 'text-brand-primary' : 'text-text-light'}`}>Public</p>
                <p className="text-xs text-text-muted">Visible to everyone</p>
              </div>
            </button>
            <button
              onClick={() => setIsPublic(false)}
              className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                !isPublic ? 'border-brand-primary bg-orange-50' : 'border-border-light hover:border-brand-primary/50'
              }`}
            >
              <Lock className={`w-5 h-5 ${!isPublic ? 'text-brand-primary' : 'text-text-muted'}`} />
              <div className="text-left">
                <p className={`text-sm font-medium ${!isPublic ? 'text-brand-primary' : 'text-text-light'}`}>Supporters only</p>
                <p className="text-xs text-text-muted">Only people who tipped</p>
              </div>
            </button>
          </div>
        </div>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">{error}</p>
        )}

        <div className="flex items-center gap-3">
          <button
            onClick={handleSave}
            disabled={saving || !title.trim() || !content.trim()}
            className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save changes'}
          </button>
          <Link href="/dashboard/posts" className="btn-ghost text-sm">Cancel</Link>
        </div>
      </div>
    </div>
  )
}