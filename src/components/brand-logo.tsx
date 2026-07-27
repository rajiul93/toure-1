'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSiteConfig } from '@/components/site-config/site-config-provider'

type BrandLogoProps = {
  className?: string
  nameClassName?: string
  scriptClassName?: string
  imageClassName?: string
  onClick?: () => void
}

export default function BrandLogo({
  className,
  nameClassName = 'truncate text-sm font-bold tracking-tight text-heading sm:text-base',
  scriptClassName = 'hidden font-script text-lg leading-none text-secondary sm:inline sm:text-xl',
  imageClassName = 'h-8 w-auto max-w-[160px] object-contain sm:h-9',
  onClick,
}: BrandLogoProps) {
  const site = useSiteConfig()
  const { brand } = site

  if (brand.logo.url) {
    return (
      <Image
        src={brand.logo.url}
        alt={brand.logo.alt_text || brand.full}
        width={160}
        height={40}
        className={imageClassName}
        priority
      />
    )
  }

  return (
    <span className={className ?? 'inline-flex min-w-0 items-baseline gap-1.5'}>
      <span className={nameClassName}>{brand.name}</span>
      <span className={scriptClassName}>{brand.script}</span>
    </span>
  )
}

export function BrandLogoLink({
  href = '/',
  className,
  nameClassName,
  scriptClassName,
  imageClassName,
  onClick,
}: BrandLogoProps & { href?: string }) {
  return (
    <Link
      href={href}
      className={
        className ??
        'group inline-flex min-w-0 shrink-0 items-baseline gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2'
      }
      onClick={onClick}
    >
      <BrandLogo
        nameClassName={nameClassName}
        scriptClassName={scriptClassName}
        imageClassName={imageClassName}
      />
    </Link>
  )
}
