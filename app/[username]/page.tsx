export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Image from 'next/image'
import { supabaseAdmin } from '@/lib/supabase'
import PaymentForm from '@/components/payment/PaymentForm'
import SupportFeed from '@/components/feed/SupportFeed'
import { getInitials } from '@/lib/utils'
import { Coffee, Users, Heart } from 'lucide-react'
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

  const { data: creator } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()

  if (!creator) notFound()

  // Supporter stats
  const { count: supporterCount } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('creator_id', creator.id)

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
          {/* Avatar */}
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
              <Coffee className="w-4 h-4 text-brand-secondary" />
              <span>Accepting tips</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-3xl mx-auto px-4 py-10 grid md:grid-cols-5 gap-8">
        {/* Left: Feed */}
        <div className="md:col-span-3 space-y-6">
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