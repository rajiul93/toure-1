import type { AttractionTourCard } from '@/lib/attraction-tour-detail'
import Image from 'next/image'
import Link from 'next/link'
import { FaStar } from 'react-icons/fa6'

export default function TourExperienceCard({ item }: { item: AttractionTourCard }) {
  return (
    <article className="w-[17rem] shrink-0 snap-start sm:w-[18.5rem]">
      <Link href={item.href} className="group block">
        <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-zinc-100 ring-1 ring-zinc-200/80">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            sizes="(max-width: 640px) 272px, 296px"
            className="object-cover transition duration-500 group-hover:scale-105"
          />
        </div>
        <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-snug text-heading transition group-hover:text-primary">
          {item.title}
        </h3>
        <div className="mt-2 flex items-center gap-2 text-sm text-zinc-600">
          <span className="inline-flex items-center gap-1 font-semibold text-heading">
            <FaStar className="size-3.5 text-primary" aria-hidden />
            {item.rating.toFixed(1)}
          </span>
          <span>({item.reviewCount.toLocaleString()})</span>
        </div>
        <p className="mt-1 text-sm font-semibold text-heading">From {item.priceFrom}</p>
      </Link>
    </article>
  )
}
