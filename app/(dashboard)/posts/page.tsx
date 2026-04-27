export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import PostCard from '@/components/posts/PostCard'
import Link from 'next/link'
import { PenLine, Plus } from 'lucide-react'
import type { PostItem } from '@/types'

export default async function PostsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = supabaseAdmin()

  const { data: user } = await supabase
    .from('users')
    .select('id, username')
    .eq('clerk_id', userId)
    .single()

  if (!user) redirect('/onboarding')

  const { data: posts } = await supabase
    .from('posts')
    .select('*')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })

  const postList = (posts || []) as PostItem[]

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-light flex items-center gap-3">
            <PenLine className="w-7 h-7 text-brand-primary" />
            Posts
          </h1>
          <p className="text-text-muted mt-1">
            Share updates, stories, and exclusive content with your supporters.
          </p>
        </div>
        <Link href="/dashboard/posts/new" className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New post
        </Link>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card p-4 text-center">
          <p className="font-display text-2xl font-bold text-text-light">
            {postList.filter(p => p.is_public).length}
          </p>
          <p className="text-xs text-text-muted mt-0.5">Public posts</p>
        </div>
        <div className="card p-4 text-center">
          <p className="font-display text-2xl font-bold text-text-light">
            {postList.filter(p => !p.is_public).length}
          </p>
          <p className="text-xs text-text-muted mt-0.5">Supporters only</p>
        </div>
      </div>

      {/* Posts list */}
      {postList.length === 0 ? (
        <div className="card p-16 text-center">
          <PenLine className="w-12 h-12 text-border-light mx-auto mb-4" />
          <p className="font-display text-xl font-bold text-text-light mb-2">
            No posts yet
          </p>
          <p className="text-text-muted text-sm mb-6">
            Share an update, behind-the-scenes story, or exclusive content.
          </p>
          <Link href="/dashboard/posts/new" className="btn-primary inline-flex items-center gap-2">
            <Plus className="w-4 h-4" /> Write your first post
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {postList.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              creatorName={user.username}
              isOwner
            />
          ))}
        </div>
      )}
    </div>
  )
}