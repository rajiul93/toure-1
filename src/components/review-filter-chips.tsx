'use client'

import { IconCheck, IconGrid } from '@/components/icons'
import { FILTER_TAGS, type FilterId } from '@/lib/reviews-data'

type ReviewFilterChipsProps = {
  activeFilter: FilterId
  onChange: (id: FilterId) => void
  layout?: 'wrap' | 'scroll'
  className?: string
}

export default function ReviewFilterChips({
  activeFilter,
  onChange,
  layout = 'wrap',
  className = '',
}: ReviewFilterChipsProps) {
  const containerClass =
    layout === 'scroll'
      ? 'flex gap-2 overflow-x-auto scrollbar-none pb-1'
      : 'flex flex-wrap gap-2'

  return (
    <div role="group" aria-label="Filter reviews by topic" className={`${containerClass} ${className}`}>
      {FILTER_TAGS.map((tag) => {
        const isActive = activeFilter === tag.id
        const isAll = tag.id === 'all'

        return (
          <button
            key={tag.id}
            type="button"
            onClick={() => onChange(tag.id)}
            aria-pressed={isActive}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-sm font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
              isAll
                ? isActive
                  ? layout === 'scroll'
                    ? 'border border-zinc-900 bg-white text-zinc-900'
                    : 'border border-zinc-900 bg-white text-zinc-900 shadow-sm'
                  : layout === 'scroll'
                    ? 'border border-zinc-300 bg-white text-zinc-700 hover:border-zinc-400'
                    : 'border border-zinc-200 bg-white text-zinc-700 hover:border-zinc-300'
                : isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-secondary-soft text-secondary-dark hover:bg-secondary-muted'
            }`}
          >
            {isAll ? (
              <IconGrid className="size-3.5 shrink-0" />
            ) : (
              <IconCheck className="size-3.5 shrink-0" />
            )}
            {tag.label}
          </button>
        )
      })}
    </div>
  )
}
