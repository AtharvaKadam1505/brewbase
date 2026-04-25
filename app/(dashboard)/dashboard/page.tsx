export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, Users, Coffee, DollarSign, ArrowUpRight } from 'lucide-react'
import SupportCard from '@/components/feed/SupportCard'
import type { PublicPayment } from '@/types'

export default async function DashboardPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = supabaseAdmin()

  const { data: user } = await supabase
    .from('users')
    .select('*')
    .eq('clerk_id', userId)
    .single()

  if (!user) redirect('/onboarding')

  const { data: payments } = await supabase
    .from('payments')
    .select('amount, created_at, message, is_anonymous, show_amount, user_id, users!payments_user_id_fkey(username)')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20)

  const totalEarnings = payments?.reduce((sum, p) => sum + (p.amount || 0), 0) || 0
  const now = new Date()
  const thisMonth = payments?.filter((p) => {
    const date = new Date(p.created_at)
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
  }) || []
  const monthlyEarnings = thisMonth.reduce((sum, p) => sum + (p.amount || 0), 0)

  // Count unique supporters (distinct user_ids, not payment rows)
  const uniqueSupporterIds = new Set(
    (payments || []).filter(p => p.user_id).map(p => p.user_id)
  )
  const uniqueMonthlyIds = new Set(
    thisMonth.filter(p => p.user_id).map(p => p.user_id)
  )
  // Add anonymous payments as individual unique supporters
  const anonTotal   = (payments || []).filter(p => !p.user_id).length
  const anonMonthly = thisMonth.filter(p => !p.user_id).length
  const totalSupporters   = uniqueSupporterIds.size + anonTotal
  const monthlySupporters = uniqueMonthlyIds.size  + anonMonthly

  const recentPayments: PublicPayment[] = (payments || []).slice(0, 5).map((p: any) => ({
    id: p.id || Math.random().toString(),
    supporter_name: p.is_anonymous ? null : p.users?.username || null,
    amount: p.show_amount ? p.amount : null,
    message: p.message,
    created_at: p.created_at,
  }))

  const stats = [
    {
      label: 'Total earnings',
      value: formatCurrency(totalEarnings),
      icon: <DollarSign className="w-5 h-5" />,
      color: 'text-green-600',
      bg: 'bg-green-100',
    },
    {
      label: 'This month',
      value: formatCurrency(monthlyEarnings),
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-brand-primary',
      bg: 'bg-orange-100',
    },
    {
      label: 'Total supporters',
      value: totalSupporters,
      icon: <Users className="w-5 h-5" />,
      color: 'text-blue-600',
      bg: 'bg-blue-100',
    },
    {
      label: 'This month',
      value: monthlySupporters,
      icon: <Coffee className="w-5 h-5" />,
      color: 'text-brand-secondary',
      bg: 'bg-yellow-100',
    },
  ]

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-8 flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-text-light">
            Welcome back, {user.username} 👋
          </h1>
          <p className="text-text-muted mt-1">Here&apos;s what&apos;s happening with your page.</p>
        </div>
        <a
          href={`/${user.username}`}
          target="_blank"
          className="btn-primary text-sm flex items-center gap-2"
        >
          View my page <ArrowUpRight className="w-4 h-4" />
        </a>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <div key={i} className="card p-4">
            <div className={`w-10 h-10 rounded-xl ${s.bg} ${s.color} flex items-center justify-center mb-3`}>
              {s.icon}
            </div>
            <p className="text-2xl font-bold text-text-light font-display">{s.value}</p>
            <p className="text-xs text-text-muted mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-display text-xl font-bold text-text-light mb-4 flex items-center gap-2">
          <Coffee className="w-5 h-5 text-brand-primary" />
          Recent supporters
        </h2>
        {recentPayments.length === 0 ? (
          <div className="text-center py-10">
            <Coffee className="w-10 h-10 text-border-light mx-auto mb-3" />
            <p className="text-text-muted">No supporters yet. Share your page to get started!</p>
            <a href={`/${user.username}`} target="_blank" className="btn-primary text-sm mt-4 inline-flex items-center gap-2">
              Share my page <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPayments.map((p) => (
              <SupportCard key={p.id} payment={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}