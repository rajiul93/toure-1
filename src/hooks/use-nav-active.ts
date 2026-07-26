'use client'

import { NAV_LINKS } from '@/lib/nav-links'
import { usePathname } from 'next/navigation'

export function useNavActive() {
  const pathname = usePathname()

  const isLinkActive = (href: string) => {
    const link = NAV_LINKS.find((item) => item.href === href)
    return link ? link.isActive(pathname) : false
  }

  return { pathname, isLinkActive }
}
