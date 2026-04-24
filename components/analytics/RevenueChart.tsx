'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from 'recharts'
import type { DailyRevenue } from '@/types'
import { format, parseISO } from 'date-fns'

interface RevenueChartProps {
  data: DailyRevenue[]
  type?: 'area' | 'bar'
}

function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-border-light rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="font-medium text-text-light mb-1">
        {label ? format(parseISO(label), 'MMM d, yyyy') : ''}
      </p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }} className="flex items-center gap-2">
          <span>{p.name === 'amount' ? 'Revenue' : 'Tips'}:</span>
          <span className="font-bold">
            {p.name === 'amount'
              ? `₹${(p.value / 100).toFixed(0)}`
              : p.value}
          </span>
        </p>
      ))}
    </div>
  )
}

function formatYAxis(value: number) {
  if (value >= 100000) return `₹${(value / 100000).toFixed(0)}L`
  if (value >= 1000) return `₹${(value / 1000).toFixed(0)}K`
  return `₹${(value / 100).toFixed(0)}`
}

export function RevenueAreaChart({ data }: RevenueChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    dateLabel: d.date,
    displayDate: format(parseISO(d.date), 'MMM d'),
  }))

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={formatted} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#F97316" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="countGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#FBBF24" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#FBBF24" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#FDE68A" strokeOpacity={0.6} />
        <XAxis
          dataKey="displayDate"
          tick={{ fontSize: 11, fill: '#92400E' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          tickFormatter={formatYAxis}
          tick={{ fontSize: 11, fill: '#92400E' }}
          axisLine={false}
          tickLine={false}
          width={52}
        />
        <Tooltip content={<CustomTooltip />} />
        <Area
          type="monotone"
          dataKey="amount"
          name="amount"
          stroke="#F97316"
          strokeWidth={2.5}
          fill="url(#revenueGrad)"
          dot={false}
          activeDot={{ r: 5, fill: '#F97316', stroke: '#fff', strokeWidth: 2 }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}

export function TipsBarChart({ data }: RevenueChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    displayDate: format(parseISO(d.date), 'MMM d'),
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#FDE68A" strokeOpacity={0.6} vertical={false} />
        <XAxis
          dataKey="displayDate"
          tick={{ fontSize: 11, fill: '#92400E' }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 11, fill: '#92400E' }}
          axisLine={false}
          tickLine={false}
          width={28}
        />
        <Tooltip content={<CustomTooltip />} />
        <Bar
          dataKey="count"
          name="count"
          fill="#FBBF24"
          radius={[6, 6, 0, 0]}
          maxBarSize={32}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
