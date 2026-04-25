export const dynamic = 'force-dynamic'

import { auth } from '@clerk/nextjs/server'
import { redirect } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { DollarSign, Users, TrendingUp, Coffee, Award, BarChart2 } from 'lucide-react'
import { StatCard } from '@/components/analytics/StatCard'
import AnalyticsCharts from '@/components/analytics/AnalyticsCharts'
import type { AnalyticsSummary, DailyRevenue } from '@/types'

export default async function AnalyticsPage() {
  const { userId } = await auth()
  if (!userId) redirect('/sign-in')

  const supabase = supabaseAdmin()

  const { data: user } = await supabase
    .from('users')
    .select('id, username')
    .eq('clerk_id', userId)
    .single()

  if (!user) redirect('/onboarding')

  // All payments
  const { data: allPayments } = await supabase
    .from('payments')
    .select('amount, created_at, user_id')
    .eq('creator_id', user.id)
    .order('created_at', { ascending: true })

  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - 7)
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

  const payments = allPayments || []

  const total_revenue = payments.reduce((s, p) => s + p.amount, 0)
  const monthly = payments.filter((p) => new Date(p.created_at) >= startOfMonth)
  const weekly = payments.filter((p) => new Date(p.created_at) >= startOfWeek)
  const prevMonth = payments.filter((p) => {
    const d = new Date(p.created_at)
    return d >= prevMonthStart && d <= prevMonthEnd
  })

  const monthly_revenue = monthly.reduce((s, p) => s + p.amount, 0)
  const weekly_revenue = weekly.reduce((s, p) => s + p.amount, 0)
  const prev_monthly_revenue = prevMonth.reduce((s, p) => s + p.amount, 0)

  const revenueGrowth = prev_monthly_revenue === 0
    ? 100
    : Math.round(((monthly_revenue - prev_monthly_revenue) / prev_monthly_revenue) * 100)

  const uniqueSupporters = new Set(payments.filter((p) => p.user_id).map((p) => p.user_id))
  const monthlyUnique = new Set(monthly.filter((p) => p.user_id).map((p) => p.user_id))
  const avg_donation = payments.length ? Math.round(total_revenue / payments.length) : 0
  const top_donation = payments.length ? Math.max(...payments.map((p) => p.amount)) : 0

  // Daily revenue for charts (last 90 days)
  const { data: dailyRows } = await supabase
    .from('daily_revenue')
    .select('date, amount, count')
    .eq('creator_id', user.id)
    .order('date', { ascending: true })

  const daily_data: DailyRevenue[] = (dailyRows || []).map((r: any) => ({
    date: r.date,
    amount: r.amount,
    count: r.count,
  }))

  const summary: AnalyticsSummary = {
    total_revenue,
    monthly_revenue,
    weekly_revenue,
    total_supporters: uniqueSupporters.size,
    monthly_supporters: monthlyUnique.size,
    avg_donation,
    top_donation,
    daily_data,
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-text-light flex items-center gap-3">
          <BarChart2 className="w-8 h-8 text-brand-primary" />
          Analytics
        </h1>
        <p className="text-text-muted mt-1">Track your earnings and supporter trends.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Total revenue"
          value={formatCurrency(summary.total_revenue)}
          icon={<DollarSign className="w-5 h-5" />}
          iconBg="bg-green-100"
          iconColor="text-green-600"
          sub={`${payments.length} total tips`}
        />
        <StatCard
          label="This month"
          value={formatCurrency(summary.monthly_revenue)}
          icon={<TrendingUp className="w-5 h-5" />}
          iconBg="bg-orange-100"
          iconColor="text-brand-primary"
          trend={{ value: revenueGrowth, label: 'vs last month' }}
        />
        <StatCard
          label="This week"
          value={formatCurrency(summary.weekly_revenue)}
          icon={<Coffee className="w-5 h-5" />}
          iconBg="bg-yellow-100"
          iconColor="text-brand-secondary"
          sub={`${weekly.length} tips`}
        />
        <StatCard
          label="Total supporters"
          value={summary.total_supporters}
          icon={<Users className="w-5 h-5" />}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
          sub={`${summary.monthly_supporters} this month`}
        />
      </div>

      {/* Secondary stats */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <StatCard
          label="Average tip"
          value={formatCurrency(summary.avg_donation)}
          icon={<Coffee className="w-5 h-5" />}
          iconBg="bg-orange-100"
          iconColor="text-brand-primary"
        />
        <StatCard
          label="Biggest tip"
          value={formatCurrency(summary.top_donation)}
          icon={<Award className="w-5 h-5" />}
          iconBg="bg-yellow-100"
          iconColor="text-yellow-600"
        />
      </div>

      {/* Charts */}
      <AnalyticsCharts dailyData={summary.daily_data} />
    </div>
  )
}