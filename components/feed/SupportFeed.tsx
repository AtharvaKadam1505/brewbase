'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import SupportCard from './SupportCard'
import type { PublicPayment } from '@/types'
import { Loader2, Coffee } from 'lucide-react'

const PAGE_SIZE = 10

interface SupportFeedProps {
  creatorId: string
}

export default function SupportFeed({ creatorId }: SupportFeedProps) {
  const [payments, setPayments] = useState<PublicPayment[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [newIds, setNewIds] = useState<Set<string>>(new Set())

  const buildPublicPayments = async (data: any[]): Promise<PublicPayment[]> => {
    const results: PublicPayment[] = []
    for (const p of data) {
      // Fetch aggregated reactions for each payment
      const { data: reactionRows } = await supabase
        .from('reactions')
        .select('emoji')
        .eq('payment_id', p.id)

      const reactions: Record<string, number> = {}
      for (const r of reactionRows || []) {
        reactions[r.emoji] = (reactions[r.emoji] || 0) + 1
      }

      results.push({
        id: p.id,
        supporter_name: p.is_anonymous ? null : p.supporter?.username || null,
        amount: p.show_amount ? p.amount : null,
        message: p.message,
        created_at: p.created_at,
        reactions,
      })
    }
    return results
  }

  const fetchPayments = useCallback(async (from = 0) => {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        id, amount, message, is_anonymous, show_amount, created_at,
        supporter:users!payments_user_id_fkey(username)
      `)
      .eq('creator_id', creatorId)
      .order('created_at', { ascending: false })
      .range(from, from + PAGE_SIZE - 1)

    if (error) return []
    return buildPublicPayments(data || [])
  }, [creatorId])

  useEffect(() => {
    fetchPayments(0).then((data) => {
      setPayments(data)
      setHasMore(data.length === PAGE_SIZE)
      setLoading(false)
    })

    // Realtime for new payments
    const channel = supabase
      .channel(`payments:${creatorId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'payments',
        filter: `creator_id=eq.${creatorId}`,
      }, async (payload) => {
        const newPayment = payload.new as any
        const built = await buildPublicPayments([newPayment])
        setPayments((prev) => [...built, ...prev])
        setNewIds((prev) => new Set([...prev, newPayment.id]))
        setTimeout(() => {
          setNewIds((prev) => {
            const next = new Set(prev)
            next.delete(newPayment.id)
            return next
          })
        }, 4000)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [creatorId, fetchPayments])

  const loadMore = async () => {
    setLoadingMore(true)
    const more = await fetchPayments(payments.length)
    setPayments((prev) => [...prev, ...more])
    setHasMore(more.length === PAGE_SIZE)
    setLoadingMore(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-brand-primary animate-spin" />
      </div>
    )
  }

  if (payments.length === 0) {
    return (
      <div className="text-center py-12">
        <Coffee className="w-10 h-10 text-border-light mx-auto mb-3" />
        <p className="text-text-muted text-sm">Be the first to support!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {payments.map((payment) => (
        <SupportCard
          key={payment.id}
          payment={payment}
          isNew={newIds.has(payment.id)}
        />
      ))}

      {hasMore && (
        <button
          onClick={loadMore}
          disabled={loadingMore}
          className="w-full py-3 text-sm text-text-muted hover:text-brand-primary border border-border-light hover:border-brand-primary rounded-xl transition-all duration-200 flex items-center justify-center gap-2"
        >
          {loadingMore ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Loading...</>
          ) : (
            'Load more supporters'
          )}
        </button>
      )}
    </div>
  )
}
