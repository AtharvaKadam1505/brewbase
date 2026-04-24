'use client'

import { useState, useCallback } from 'react'
import { formatCurrency, formatRelativeTime, getInitials } from '@/lib/utils'
import type { PublicPayment, ReactionEmoji } from '@/types'
import { REACTION_EMOJIS } from '@/types'
import { Coffee } from 'lucide-react'

interface SupportCardProps {
  payment: PublicPayment
  isNew?: boolean
}

export default function SupportCard({ payment, isNew = false }: SupportCardProps) {
  const [reactions, setReactions] = useState<Record<string, number>>(payment.reactions || {})
  const [reacted, setReacted] = useState<Set<string>>(new Set())
  const [showPicker, setShowPicker] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)

  const name = payment.supporter_name || 'Anonymous'
  const initials = payment.supporter_name ? getInitials(payment.supporter_name) : '?'

  const handleReact = useCallback(async (emoji: ReactionEmoji) => {
    if (loading) return
    setLoading(emoji)
    setShowPicker(false)

    // Optimistic update
    const wasReacted = reacted.has(emoji)
    setReacted((prev) => {
      const next = new Set(prev)
      wasReacted ? next.delete(emoji) : next.add(emoji)
      return next
    })
    setReactions((prev) => ({
      ...prev,
      [emoji]: Math.max(0, (prev[emoji] || 0) + (wasReacted ? -1 : 1)),
    }))

    try {
      await fetch('/api/reactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: payment.id, emoji }),
      })
    } catch {
      // Revert on error
      setReacted((prev) => {
        const next = new Set(prev)
        wasReacted ? next.add(emoji) : next.delete(emoji)
        return next
      })
      setReactions((prev) => ({
        ...prev,
        [emoji]: Math.max(0, (prev[emoji] || 0) + (wasReacted ? 1 : -1)),
      }))
    } finally {
      setLoading(null)
    }
  }, [loading, reacted, payment.id])

  const totalReactions = Object.values(reactions).reduce((a, b) => a + b, 0)
  const activeReactions = Object.entries(reactions).filter(([, count]) => count > 0)

  return (
    <div
      className={`card p-4 transition-all duration-300 group ${
        isNew ? 'ring-2 ring-brand-primary/40 animate-bounce-in' : ''
      }`}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-primary to-brand-secondary flex items-center justify-center text-white text-sm font-bold">
            {payment.supporter_name ? initials : <Coffee className="w-4 h-4" />}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium text-text-light text-sm">{name}</span>
              {payment.amount !== null && (
                <span className="badge-primary text-xs">
                  {formatCurrency(payment.amount)}
                </span>
              )}
            </div>
            <span className="text-xs text-text-muted flex-shrink-0">
              {formatRelativeTime(payment.created_at)}
            </span>
          </div>

          {payment.message && (
            <p className="mt-1.5 text-sm text-text-muted bg-orange-50 dark:bg-orange-900/10 rounded-lg px-3 py-2 border border-border-light leading-relaxed">
              &ldquo;{payment.message}&rdquo;
            </p>
          )}

          {/* Reactions row */}
          <div className="mt-2.5 flex items-center gap-2 flex-wrap">
            {/* Active reactions display */}
            {activeReactions.map(([emoji, count]) => (
              <button
                key={emoji}
                onClick={() => handleReact(emoji as ReactionEmoji)}
                disabled={!!loading}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all duration-150 active:scale-90 ${
                  reacted.has(emoji)
                    ? 'bg-orange-100 border-brand-primary text-text-light font-medium'
                    : 'bg-white border-border-light text-text-muted hover:border-brand-primary hover:bg-orange-50'
                }`}
              >
                <span>{emoji}</span>
                <span>{count}</span>
              </button>
            ))}

            {/* Add reaction button */}
            <div className="relative">
              <button
                onClick={() => setShowPicker((v) => !v)}
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border border-dashed border-border-light text-text-muted hover:border-brand-primary hover:text-brand-primary transition-all duration-150 ${
                  totalReactions === 0 ? 'opacity-0 group-hover:opacity-100' : ''
                }`}
              >
                <span>+</span>
                <span>React</span>
              </button>

              {/* Emoji picker */}
              {showPicker && (
                <div className="absolute bottom-full left-0 mb-2 z-20 bg-white dark:bg-surface-darkcard border border-border-light rounded-2xl shadow-xl p-2 flex gap-1">
                  {REACTION_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => handleReact(e)}
                      disabled={!!loading}
                      className={`w-9 h-9 rounded-xl text-lg hover:bg-orange-50 transition-colors duration-100 active:scale-90 flex items-center justify-center ${
                        reacted.has(e) ? 'bg-orange-100' : ''
                      }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
