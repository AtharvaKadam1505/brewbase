'use client'

import { useState } from 'react'
import { RevenueAreaChart, TipsBarChart } from './RevenueChart'
import type { DailyRevenue } from '@/types'
import { BarChart2, TrendingUp } from 'lucide-react'

interface AnalyticsChartsProps {
  dailyData: DailyRevenue[]
}

type Range = '7d' | '30d' | '90d'

export default function AnalyticsCharts({ dailyData }: AnalyticsChartsProps) {
  const [range, setRange] = useState<Range>('30d')

  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90
  const filtered = dailyData.slice(-days)

  // Fill missing days with zeros for a clean chart
  const filledData: DailyRevenue[] = []
  for (let i = days - 1; i >= 0; i--) {
    try {
      const d = new Date()
      d.setDate(d.getDate() - i)
      if (isNaN(d.getTime())) continue
      const dateStr = d.toISOString().split('T')[0]
      const existing = filtered.find((f) => f.date === dateStr)
      filledData.push(existing || { date: dateStr, amount: 0, count: 0 })
    } catch {
      continue
    }
  }

  const totalInRange = filledData.reduce((s, d) => s + d.amount, 0)
  const tipsInRange = filledData.reduce((s, d) => s + d.count, 0)

  return (
    <div className="space-y-6">
      {/* Range selector */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-1 bg-surface-light border border-border-light rounded-xl p-1">
          {(['7d', '30d', '90d'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                range === r
                  ? 'bg-brand-primary text-white shadow-sm'
                  : 'text-text-muted hover:text-text-light'
              }`}
            >
              {r === '7d' ? 'Week' : r === '30d' ? 'Month' : '3 Months'}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-text-muted">
            Revenue: <strong className="text-brand-primary">₹{(totalInRange / 100).toFixed(0)}</strong>
          </span>
          <span className="text-text-muted">
            Tips: <strong className="text-brand-secondary">{tipsInRange}</strong>
          </span>
        </div>
      </div>

      {/* Revenue chart */}
      <div className="card p-5">
        <h3 className="text-sm font-medium text-text-light flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-brand-primary" />
          Revenue over time
        </h3>
        {filledData.every((d) => d.amount === 0) ? (
          <div className="h-[260px] flex items-center justify-center text-text-muted text-sm">
            No revenue data for this period
          </div>
        ) : (
          <RevenueAreaChart data={filledData} />
        )}
      </div>

      {/* Tips chart */}
      <div className="card p-5">
        <h3 className="text-sm font-medium text-text-light flex items-center gap-2 mb-4">
          <BarChart2 className="w-4 h-4 text-brand-secondary" />
          Tips per day
        </h3>
        {filledData.every((d) => d.count === 0) ? (
          <div className="h-[200px] flex items-center justify-center text-text-muted text-sm">
            No tips in this period
          </div>
        ) : (
          <TipsBarChart data={filledData} />
        )}
      </div>
    </div>
  )
}