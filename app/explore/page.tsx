export const dynamic = 'force-dynamic'

import { supabaseAdmin } from '@/lib/supabase'
import { getInitials } from '@/lib/utils'
import Link from 'next/link'
import Image from 'next/image'
import NavBar from '@/components/layout/Navbar'
import { Coffee, Search, Users } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Explore Creators — BrewBase',
  description: 'Discover and support amazing creators on BrewBase.',
}

export default async function ExplorePage() {
  const supabase = supabaseAdmin()

  // Fetch all creators who have at least set a bio or received a payment
  const { data: creators } = await supabase
    .from('users')
    .select(`
      id, username, bio, avatar_url, created_at
    `)
    .order('created_at', { ascending: false })
    .limit(50)

  // Get support counts for each creator
  const creatorIds = (creators || []).map((c) => c.id)
  const { data: paymentCounts } = await supabase
    .from('payments')
    .select('creator_id')
    .in('creator_id', creatorIds.length ? creatorIds : ['none'])

  const countMap: Record<string, number> = {}
  for (const p of paymentCounts || []) {
    countMap[p.creator_id] = (countMap[p.creator_id] || 0) + 1
  }

  return (
    <div className="min-h-screen bg-surface-light">
      <NavBar />

      <div className="max-w-5xl mx-auto px-4 pt-28 pb-16">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="font-display text-4xl font-bold text-text-light mb-3">
            Explore Creators
          </h1>
          <p className="text-text-muted text-lg max-w-xl mx-auto">
            Discover talented creators and show them some love ☕
          </p>
        </div>

        {/* Creator grid */}
        {!creators || creators.length === 0 ? (
          <div className="text-center py-20">
            <Coffee className="w-12 h-12 text-border-light mx-auto mb-4" />
            <p className="font-display text-xl font-bold text-text-light mb-2">
              No creators yet
            </p>
            <p className="text-text-muted mb-6">Be the first one!</p>
            <Link href="/sign-up" className="btn-primary">
              Create your page
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {creators.map((creator) => (
              <Link
                key={creator.id}
                href={`/${creator.username}`}
                className="card p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 group"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="flex-shrink-0">
                    {creator.avatar_url ? (
                      <Image
                        src={creator.avatar_url}
                        alt={creator.username}
                        width={52}
                        height={52}
                        className="w-13 h-13 rounded-full object-cover ring-2 ring-border-light"
                      />
                    ) : (
                      <div className="w-13 h-13 w-[52px] h-[52px] rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white font-bold text-lg ring-2 ring-border-light">
                        {getInitials(creator.username)}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display font-bold text-text-light truncate group-hover:text-brand-primary transition-colors">
                        {creator.username}
                      </h3>
                      <Coffee className="w-4 h-4 text-brand-primary flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {creator.bio ? (
                      <p className="text-sm text-text-muted mt-1 line-clamp-2 leading-relaxed">
                        {creator.bio}
                      </p>
                    ) : (
                      <p className="text-sm text-text-muted mt-1 italic opacity-60">
                        No bio yet
                      </p>
                    )}

                    <div className="flex items-center gap-1.5 mt-3">
                      <Users className="w-3.5 h-3.5 text-brand-primary" />
                      <span className="text-xs text-text-muted">
                        <strong className="text-text-light">
                          {countMap[creator.id] || 0}
                        </strong>{' '}
                        supporter{countMap[creator.id] !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Support CTA */}
                <div className="mt-4 pt-4 border-t border-border-light">
                  <span className="text-xs font-medium text-brand-primary group-hover:underline">
                    Buy {creator.username} a coffee →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}