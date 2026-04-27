'use client'

import { useEffect, useState } from 'react'
import { Target } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface GoalProgressProps {
  goalAmount:  number
  goalLabel:   string | null
  creatorId:   string
}

export default function GoalProgress({ goalAmount, goalLabel, creatorId }: GoalProgressProps) {
  const [earned, setEarned] = useState<number | null>(null)

  useEffect(() => {
    // Fetch this month's earnings for the creator
    const fetchEarnings = async () => {
      const res  = await fetch(`/api/goal-progress?creatorId=${creatorId}`)
      const data = await res.json()
      setEarned(data.monthly_amount ?? 0)
    }
    fetchEarnings()
  }, [creatorId])

  if (earned === null) return null

  const pct        = Math.min(100, Math.round((earned / goalAmount) * 100))
  const reached    = pct >= 100
  const remaining  = Math.max(0, goalAmount - earned)

  return (
    <div className="card p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-brand-primary" />
        <span className="text-sm font-medium text-text-light">
          {goalLabel || 'Monthly Goal'}
        </span>
        <span className={`ml-auto text-xs font-bold px-2 py-0.5 rounded-full ${
          reached
            ? 'bg-green-100 text-green-700'
            : 'bg-orange-100 text-brand-primary'
        }`}>
          {pct}%
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-3 bg-border-light rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            reached
              ? 'bg-gradient-to-r from-green-400 to-green-500'
              : 'bg-gradient-to-r from-brand-primary to-brand-secondary'
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>

      <div className="flex items-center justify-between mt-2">
        <span className="text-xs text-text-muted">
          {formatCurrency(earned)} raised
        </span>
        {reached ? (
          <span className="text-xs text-green-600 font-medium">🎉 Goal reached!</span>
        ) : (
          <span className="text-xs text-text-muted">
            {formatCurrency(remaining)} to go · {formatCurrency(goalAmount)} goal
          </span>
        )}
      </div>
    </div>
  )
}