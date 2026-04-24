import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: string | number
  sub?: string
  icon: ReactNode
  iconBg: string
  iconColor: string
  trend?: { value: number; label: string }
}

export function StatCard({ label, value, sub, icon, iconBg, iconColor, trend }: StatCardProps) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', iconBg, iconColor)}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={cn(
            'text-xs font-medium px-2 py-0.5 rounded-full',
            trend.value >= 0
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-600'
          )}>
            {trend.value >= 0 ? '↑' : '↓'} {Math.abs(trend.value)}% {trend.label}
          </span>
        )}
      </div>
      <p className="font-display text-2xl font-bold text-text-light leading-tight">{value}</p>
      <p className="text-xs text-text-muted mt-0.5">{label}</p>
      {sub && <p className="text-xs text-text-muted mt-1 border-t border-border-light pt-1">{sub}</p>}
    </div>
  )
}
