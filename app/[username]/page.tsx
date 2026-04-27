export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Image from 'next/image'
import { auth } from '@clerk/nextjs/server'
import { supabaseAdmin } from '@/lib/supabase'
import PaymentForm from '@/components/payment/PaymentForm'
import SupportFeed from '@/components/feed/SupportFeed'
import { getInitials, formatRelativeTime } from '@/lib/utils'
import { Coffee, Users, Heart, Globe, Lock, PenLine } from 'lucide-react'
import GoalProgress from '@/components/goal/GoalProgress'
import Link from 'next/link'
import type { Metadata } from 'next'

interface Props {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params
  const { data: creator } = await supabaseAdmin()
    .from('users')
    .select('username, bio')
    .eq('username', username)
    .single()
  if (!creator) return { title: 'Creator not found' }
  return {
    title: `${creator.username} — BrewBase`,
    description: creator.bio || `Support ${creator.username} on BrewBase`,
  }
}

export default async function CreatorProfilePage({ params }: Props) {
  const { username } = await params
  const supabase = supabaseAdmin()

  // Get logged-in user (if any)
  const { userId: clerkId } = await auth()

  const { data: creator } = await supabase
    .from('users')
    .select('id, username, bio, avatar_url, created_at, goal_amount, goal_label, thank_you_msg')
    .eq('username', username)
    .single()

  if (!creator) notFound()

  // Get viewer's Supabase id
  let viewerDbId: string | null = null
  if (clerkId) {
    const { data: viewer } = await supabase
      .from('users')
      .select('id')
      .eq('clerk_id', clerkId)
      .single()
    viewerDbId = viewer?.id || null
  }

  // Check if viewer is the creator themselves
  const isOwner = viewerDbId === creator.id

  // Check if viewer is a supporter (has made at least one payment to this creator)
  let isSupporter = false
  if (viewerDbId && !isOwner) {
    const { data: payment } = await supabase
      .from('payments')
      .select('id')
      .eq('creator_id', creator.id)
      .eq('user_id', viewerDbId)
      .limit(1)
      .single()
    isSupporter = !!payment
  }

  // Owner and supporters can see all posts — others only see public ones
  const canSeeAll = isOwner || isSupporter

  // Fetch posts accordingly
  const postsQuery = supabase
    .from('posts')
    .select('id, title, content, is_public, created_at')
    .eq('creator_id', creator.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: allPosts } = await postsQuery
  const posts = allPosts || []

  // Unique supporter count
  const { data: supporterRows } = await supabase
    .from('payments')
    .select('user_id')
    .eq('creator_id', creator.id)

  const uniqueIds      = new Set((supporterRows || []).filter(p => p.user_id).map(p => p.user_id))
  const anonCount      = (supporterRows || []).filter(p => !p.user_id).length
  const supporterCount = uniqueIds.size + anonCount

  // Top supporters
  const { data: topSupporters } = await supabase
    .from('payments')
    .select('amount, is_anonymous, user_id, users!payments_user_id_fkey(username)')
    .eq('creator_id', creator.id)
    .eq('show_amount', true)
    .order('amount', { ascending: false })
    .limit(3)

  return (
    <div className="min-h-screen bg-surface-light">
      {/* Header */}
      <div className="bg-gradient-to-b from-orange-100 to-surface-light border-b border-border-light">
        <div className="max-w-3xl mx-auto px-4 py-12 text-center">
          <div className="relative inline-block mb-4">
            {creator.avatar_url ? (
              <Image
                src={creator.avatar_url}
                alt={creator.username}
                width={96}
                height={96}
                className="w-24 h-24 rounded-full object-cover ring-4 ring-white shadow-lg"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-3xl font-bold ring-4 ring-white shadow-lg">
                {getInitials(creator.username)}
              </div>
            )}
            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-green-400 border-2 border-white" />
          </div>

          <h1 className="font-display text-3xl font-bold text-text-light mb-2">
            {creator.username}
          </h1>

          {creator.bio && (
            <p className="text-text-muted max-w-md mx-auto leading-relaxed mb-4">
              {creator.bio}
            </p>
          )}

          <div className="flex items-center justify-center gap-6 text-sm text-text-muted">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-brand-primary" />
              <span><strong className="text-text-light">{supporterCount || 0}</strong> supporters</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PenLine className="w-4 h-4 text-brand-secondary" />
              <span><strong className="text-text-light">{posts.length}</strong> posts</span>
            </div>
          </div>

          {/* Supporter badge */}
          {isSupporter && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-orange-100 text-brand-primary text-xs font-medium px-3 py-1 rounded-full">
              <Coffee className="w-3 h-3" /> You&apos;re a supporter ☕
            </div>
          )}
          {isOwner && (
            <div className="mt-3 inline-flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-medium px-3 py-1 rounded-full">
              ✏️ Your page
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 py-10 grid md:grid-cols-5 gap-8">
        {/* Left column */}
        <div className="md:col-span-3 space-y-6">

          {/* Goal progress bar */}
          {creator.goal_amount && creator.goal_amount > 0 && (
            <GoalProgress
              goalAmount={creator.goal_amount}
              goalLabel={creator.goal_label}
              creatorId={creator.id}
            />
          )}

          {/* Posts section */}
          {posts.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-bold text-text-light mb-3 flex items-center gap-2">
                <PenLine className="w-5 h-5 text-brand-primary" /> Posts
              </h2>
              <div className="space-y-3">
                {posts.map((post: any) => {
                  const preview = post.content
                    .replace(/#{1,6}\s/g, '')
                    .replace(/\*\*/g, '')
                    .replace(/\n/g, ' ')
                    .trim()
                    .slice(0, 160)

                  // ── Locked post — viewer is NOT a supporter ───────────
                  if (!post.is_public && !canSeeAll) {
                    return (
                      <div key={post.id} className="card p-5 relative overflow-hidden">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-brand-primary">
                            <Lock className="w-3 h-3" /> Supporters only
                          </span>
                          <span className="text-xs text-text-muted">
                            {formatRelativeTime(post.created_at)}
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-text-light text-base mb-2">
                          {post.title}
                        </h3>
                        {/* Blurred preview */}
                        <div className="relative">
                          <p
                            className="text-sm text-text-muted line-clamp-2 leading-relaxed select-none"
                            style={{ filter: 'blur(4px)', userSelect: 'none' }}
                          >
                            {preview}
                          </p>
                          <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex items-center gap-2 bg-white/90 border border-border-light rounded-xl px-3 py-1.5 shadow-sm">
                              <Lock className="w-3.5 h-3.5 text-brand-primary" />
                              <span className="text-xs font-medium text-text-light">
                                Support to unlock
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  }

                  // ── Public post OR viewer is supporter/owner ──────────
                  return (
                    <Link
                      key={post.id}
                      href={`/${creator.username}/posts/${post.id}`}
                      className="card p-5 block hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {post.is_public ? (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-green-100 text-green-700">
                            <Globe className="w-3 h-3" /> Public
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium bg-orange-100 text-brand-primary">
                            <Lock className="w-3 h-3" /> Supporters only
                          </span>
                        )}
                        <span className="text-xs text-text-muted">
                          {formatRelativeTime(post.created_at)}
                        </span>
                      </div>
                      <h3 className="font-display font-bold text-text-light text-base mb-1 group-hover:text-brand-primary transition-colors">
                        {post.title}
                      </h3>
                      <p className="text-sm text-text-muted line-clamp-2 leading-relaxed">
                        {preview}{preview.length === 160 ? '…' : ''}
                      </p>
                      <p className="text-xs text-brand-primary mt-2 font-medium group-hover:underline">
                        Read post →
                      </p>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}

          {/* Top supporters */}
          {topSupporters && topSupporters.length > 0 && (
            <div>
              <h2 className="font-display text-xl font-bold text-text-light mb-3 flex items-center gap-2">
                <Heart className="w-5 h-5 text-brand-accent" /> Top supporters
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {topSupporters.map((s: any, i) => (
                  <div key={i} className="card p-3 text-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-sm font-bold mx-auto mb-2">
                      {s.is_anonymous ? '?' : getInitials((s.users as any)?.username || '?')}
                    </div>
                    <p className="text-xs font-medium text-text-light truncate">
                      {s.is_anonymous ? 'Anonymous' : (s.users as any)?.username}
                    </p>
                    <p className="text-xs text-brand-primary font-semibold mt-0.5">
                      ₹{(s.amount / 100).toFixed(0)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Support feed */}
          <div>
            <h2 className="font-display text-xl font-bold text-text-light mb-3 flex items-center gap-2">
              <Coffee className="w-5 h-5 text-brand-primary" /> Recent supporters
            </h2>
            <SupportFeed creatorId={creator.id} />
          </div>
        </div>

        {/* Right: Payment form */}
        <div className="md:col-span-2">
          <div className="sticky top-6">
            <PaymentForm creatorId={creator.id} creatorName={creator.username} />
          </div>
        </div>
      </div>
    </div>
  )
}