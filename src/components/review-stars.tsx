import { IconStar } from '@/components/icons'

export default function ReviewStars({
  rating,
  size = 'md',
}: {
  rating: number
  size?: 'sm' | 'md'
}) {
  const iconClass = size === 'sm' ? 'size-3.5' : 'size-4'

  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, index) => (
        <IconStar
          key={index}
          className={`${iconClass} ${index < rating ? 'text-primary' : 'text-zinc-200'}`}
        />
      ))}
    </div>
  )
}
