export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { formatCurrency, getInitials } from '@/lib/utils'
import { Trophy, Medal, Crown, Coffee, TrendingUp } from 'lucide-react'
import type { LeaderboardEntry } from '@/types'

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center shadow-md">
        <Crown className="w-4 h-4 text-white" />
      </div>
    )
  if (rank === 2)
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center shadow-sm">
        <Medal className="w-4 h-4 text-white" />
      </div>
    )
  if (rank === 3)
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-300 to-orange-500 flex items-center justify-center shadow-sm">
        <Medal className="w-4 h-4 text-white" />
      </div>
    )
  return (
    <div className="w-8 h-8 rounded-full bg-surface-light border border-border-light flex items-center justify-center">
      <span className="text-xs font-bold text-text-muted">#{rank}</span>
    </div>
  )
}

function PodiumCard({ entry, position }: { entry: LeaderboardEntry; position: 1 | 2 | 3 }) {
  const heights = { 1: 'h-36', 2: 'h-24', 3: 'h-20' }
  const orders = { 1: 'order-2', 2: 'order-1', 3: 'order-3' }
  const scales = { 1: 'scale-110', 2: 'scale-100', 3: 'scale-100' }
  const colors = {
    1: 'from-yellow-400 to-amber-500',
    2: 'from-slate-300 to-slate-400',
    3: 'from-orange-300 to-orange-400',
  }
  const name = entry.is_anonymous ? 'Anonymous' : entry.supporter_name || 'Anonymous'
  const initials = entry.is_anonymous ? '?' : getInitials(name)

  return (
    <div className={`flex flex-col items-center gap-2 ${orders[position]} ${scales[position]} transition-transform`}>
      {/* Avatar */}
      <div className={`w-14 h-14 rounded-full bg-gradient-to-br ${colors[position]} flex items-center justify-center text-white font-bold text-lg shadow-lg ring-4 ring-white`}>
        {initials}
      </div>
      {position === 1 && <Crown className="w-5 h-5 text-yellow-500 -mt-1" />}

      <div className="text-center">
        <p className="text-sm font-bold text-text-light max-w-[80px] truncate">{name}</p>
        <p className="text-xs text-brand-primary font-semibold">{formatCurrency(entry.total_amount)}</p>
        <p className="text-xs text-text-muted">{entry.support_count} tip{entry.support_count !== 1 ? 's' : ''}</p>
      </div>

      {/* Podium block */}
      <div className={`w-24 ${heights[position]} bg-gradient-to-t ${colors[position]} rounded-t-2xl flex items-start justify-center pt-3 shadow-lg`}>
        <span className="text-white font-display font-bold text-2xl">#{position}</span>
      </div>
    </div>
  )
}

export default async function LeaderboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = supabaseAdmin()

  const { data: user } = await supabase
    .from('users')
    .select('id, username')
    .eq('clerk_id', userId)
    .single()

  if (!user) redirect('/onboarding')

  // Fetch leaderboard from view
  const { data: rows } = await supabase
    .from('leaderboard')
    .select('*')
    .eq('creator_id', user.id)
    .order('rank', { ascending: true })
    .limit(50)

  const entries: LeaderboardEntry[] = (rows || []).map((r: any) => ({
    rank: r.rank,
    supporter_name: r.is_anonymous ? null : r.supporter_name,
    total_amount: r.total_amount,
    support_count: r.support_count,
    latest_at: r.latest_at,
    is_anonymous: r.is_anonymous,
  }))

  const podium = entries.slice(0, 3)
  const rest = entries.slice(3)
  const totalGiven = entries.reduce((s, e) => s + e.total_amount, 0)

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-text-light flex items-center gap-3">
          <Trophy className="w-8 h-8 text-yellow-500" />
          Supporter Leaderboard
        </h1>
        <p className="text-text-muted mt-1">Your most loyal coffee buyers — all time.</p>
      </div>

      {entries.length === 0 ? (
        <div className="card p-16 text-center">
          <Coffee className="w-12 h-12 text-border-light mx-auto mb-4" />
          <p className="font-display text-xl font-bold text-text-light mb-2">No supporters yet</p>
          <p className="text-text-muted text-sm">Share your page to start collecting support!</p>
        </div>
      ) : (
        <>
          {/* Summary strip */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Total supporters', value: entries.length },
              { label: 'Total raised', value: formatCurrency(totalGiven) },
              { label: 'Avg donation', value: formatCurrency(Math.round(totalGiven / entries.length)) },
            ].map((s, i) => (
              <div key={i} className="card p-4 text-center">
                <p className="font-display text-2xl font-bold text-text-light">{s.value}</p>
                <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Podium — top 3 */}
          {podium.length >= 1 && (
            <div className="card p-8 mb-6 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 to-transparent pointer-events-none" />
              <h2 className="font-display text-lg font-bold text-text-light mb-8 text-center flex items-center justify-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" /> Hall of Fame
              </h2>
              <div className="flex items-end justify-center gap-4">
                {podium.length >= 2 && <PodiumCard entry={podium[1]} position={2} />}
                <PodiumCard entry={podium[0]} position={1} />
                {podium.length >= 3 && <PodiumCard entry={podium[2]} position={3} />}
              </div>
            </div>
          )}

          {/* Full table */}
          {rest.length > 0 && (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-border-light flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-brand-primary" />
                <h2 className="font-medium text-text-light text-sm">All supporters</h2>
              </div>
              <div className="divide-y divide-border-light">
                {rest.map((entry) => {
                  const name = entry.is_anonymous ? 'Anonymous' : entry.supporter_name || 'Anonymous'
                  const initials = entry.is_anonymous ? '?' : getInitials(name)
                  return (
                    <div key={entry.rank} className="flex items-center gap-4 px-5 py-3 hover:bg-orange-50/50 transition-colors">
                      <RankBadge rank={entry.rank} />
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-primary/70 to-brand-secondary/70 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-text-light truncate">{name}</p>
                        <p className="text-xs text-text-muted">
                          {entry.support_count} tip{entry.support_count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-bold text-brand-primary">{formatCurrency(entry.total_amount)}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}