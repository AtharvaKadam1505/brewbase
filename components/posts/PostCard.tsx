import { formatRelativeTime } from '@/lib/utils'
import type { PostItem } from '@/types'
import { Lock, Globe } from 'lucide-react'
import Link from 'next/link'

interface PostCardProps {
  post:        PostItem
  creatorName: string
  isOwner?:    boolean
}

export default function PostCard({ post, creatorName, isOwner = false }: PostCardProps) {
  // Strip markdown for preview
  const preview = post.content
    .replace(/#{1,6}\s/g, '')
    .replace(/\*\*/g, '')
    .replace(/\*/g, '')
    .replace(/\n/g, ' ')
    .trim()
    .slice(0, 180)

  return (
    <div className="card p-5 hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium ${
              post.is_public
                ? 'bg-green-100 text-green-700'
                : 'bg-orange-100 text-brand-primary'
            }`}>
              {post.is_public
                ? <><Globe className="w-3 h-3" /> Public</>
                : <><Lock className="w-3 h-3" /> Supporters only</>
              }
            </span>
            <span className="text-xs text-text-muted">
              {formatRelativeTime(post.created_at)}
            </span>
          </div>
          <h3 className="font-display font-bold text-text-light text-lg leading-snug">
            {post.title}
          </h3>
        </div>

        {isOwner && (
          <Link
            href={`/dashboard/posts/${post.id}/edit`}
            className="text-xs text-text-muted hover:text-brand-primary border border-border-light hover:border-brand-primary px-3 py-1 rounded-lg transition-colors flex-shrink-0"
          >
            Edit
          </Link>
        )}
      </div>

      {/* Preview */}
      <p className="text-sm text-text-muted leading-relaxed line-clamp-3">
        {preview}{preview.length === 180 ? '…' : ''}
      </p>

      {/* Read more */}
      <div className="mt-4 pt-3 border-t border-border-light">
        <Link
          href={`/${creatorName}/posts/${post.id}`}
          className="text-sm text-brand-primary font-medium hover:underline"
        >
          Read full post →
        </Link>
      </div>
    </div>
  )
}