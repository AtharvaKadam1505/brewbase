export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { formatRelativeTime, getInitials } from '@/lib/utils'
import { ArrowLeft, Globe, Lock } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ username: string; postId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { postId } = await params
  const { data: post } = await supabaseAdmin()
    .from('posts').select('title').eq('id', postId).single()
  return { title: post ? `${post.title} — BrewBase` : 'Post not found' }
}

export default async function PublicPostPage({ params }: Props) {
  const { username, postId } = await params
  const supabase = supabaseAdmin()

  const { data: creator } = await supabase
    .from('users').select('id, username, avatar_url').eq('username', username).single()
  if (!creator) notFound()

  const { data: post } = await supabase
    .from('posts').select('*').eq('id', postId).eq('creator_id', creator.id).single()
  if (!post) notFound()

  return (
    <div className="min-h-screen bg-surface-light">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Back link */}
        <Link
          href={`/${username}`}
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-brand-primary mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {username}&apos;s page
        </Link>

        {/* Post header */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium ${
              post.is_public
                ? 'bg-green-100 text-green-700'
                : 'bg-orange-100 text-brand-primary'
            }`}>
              {post.is_public
                ? <><Globe className="w-3 h-3" /> Public</>
                : <><Lock className="w-3 h-3" /> Supporters only</>
              }
            </span>
            <span className="text-sm text-text-muted">
              {formatRelativeTime(post.created_at)}
            </span>
          </div>

          <h1 className="font-display text-3xl sm:text-4xl font-bold text-text-light leading-tight mb-6">
            {post.title}
          </h1>

          {/* Author */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-sm font-bold">
              {getInitials(creator.username)}
            </div>
            <div>
              <Link href={`/${username}`} className="text-sm font-medium text-text-light hover:text-brand-primary transition-colors">
                {creator.username}
              </Link>
              <p className="text-xs text-text-muted">Creator on BrewBase</p>
            </div>
          </div>
        </div>

        <hr className="border-border-light mb-8" />

        {/* Post content */}
        <div
          className="text-text-light text-base leading-relaxed"
          style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
        >
          {post.content}
        </div>

        <hr className="border-border-light mt-12 mb-8" />

        {/* Support CTA */}
        <div className="card p-6 text-center">
          <p className="text-text-muted text-sm mb-4">
            Enjoyed this post? Support {creator.username} with a coffee ☕
          </p>
          <Link href={`/${username}`} className="btn-primary inline-flex items-center gap-2">
            Support {creator.username}
          </Link>
        </div>
      </div>
    </div>
  )
}