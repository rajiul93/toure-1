export type NavLinkItem = {
  href: string
  label: string
  isActive: (pathname: string) => boolean
}

export const NAV_LINKS: NavLinkItem[] = [
  {
    href: '/attraction-tours',
    label: 'Attraction Tours',
    isActive: (pathname) =>
      pathname === '/attraction-tours' || pathname.startsWith('/attraction-tours/'),
  },
  
  {
    href: '/blog',
    label: 'Blog',
    isActive: (pathname) => pathname === '/blog' || pathname.startsWith('/blog/'),
  },
  {
    href: '/reviews',
    label: 'Reviews',
    isActive: (pathname) => pathname === '/reviews',
  },
  {
    href: '/about-us',
    label: 'About Us',
    isActive: (pathname) => pathname === '/about-us',
  },
]
