'use client'

import { BrandLogoLink } from '@/components/brand-logo'
import { IconClose, IconMenu } from '@/components/icons'
import NavMenuBar from '@/components/nav-menu-bar'
import { useSiteConfig } from '@/components/site-config/site-config-provider'
import { useNavActive } from '@/hooks/use-nav-active'
import { lockBodyScroll } from '@/hooks/use-modal-behavior'
import { NAV_LINKS } from '@/lib/nav-links'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useId, useState } from 'react'
import { BsWhatsapp } from 'react-icons/bs'

export default function Navbar() {
  const site = useSiteConfig()
  const [open, setOpen] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isVisible, setIsVisible] = useState(false)
  const menuId = useId()
  const { isLinkActive } = useNavActive()
  const pathname = usePathname()

  // Close menu when route changes (deferred to satisfy set-state-in-effect lint).
  useEffect(() => {
    const id = window.setTimeout(() => setOpen(false), 0)
    return () => window.clearTimeout(id)
  }, [pathname])

  useEffect(() => {
    if (open) {
      const frame = requestAnimationFrame(() => {
        setIsVisible(true)
        requestAnimationFrame(() => setIsAnimating(true))
      })
      return () => cancelAnimationFrame(frame)
    }

    // Both timers must be captured: the inner one used to leak, so a rapid
    // open → close → open could unmount the drawer mid-open-animation.
    let hideId: number | undefined
    const id = window.setTimeout(() => {
      setIsAnimating(false)
      hideId = window.setTimeout(() => setIsVisible(false), 300)
    }, 0)

    return () => {
      window.clearTimeout(id)
      if (hideId !== undefined) window.clearTimeout(hideId)
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    // Restores the previous value instead of clearing it — closing the drawer
    // used to wipe the photo lightbox's scroll lock when both were open.
    const releaseScroll = lockBodyScroll()
    window.addEventListener('keydown', onKeyDown)

    return () => {
      releaseScroll()
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const closeMenu = () => setOpen(false)

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/85 backdrop-blur-md supports-backdrop-filter:bg-white/75">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 px-4 sm:h-16">
        <BrandLogoLink onClick={closeMenu} />

        <div className="hidden min-w-0 flex-1 justify-center lg:flex">
          <NavMenuBar />
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <a
            href={site.contact.whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-xl bg-success px-3.5 py-2 text-sm font-semibold text-success-foreground transition hover:bg-success-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2 sm:inline-flex"
          >
            <BsWhatsapp className="size-4 shrink-0" aria-hidden="true" />
            {site.contact.whatsappNavLabel}
          </a>

          <button
            type="button"
            className="relative inline-flex size-10 items-center justify-center rounded-xl border border-zinc-200 bg-white text-zinc-700 transition hover:bg-zinc-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary lg:hidden"
            aria-expanded={open}
            aria-controls={menuId}
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((prev) => !prev)}
          >
            <span className="relative flex size-5 items-center justify-center">
              <IconMenu
                className={`absolute size-5 transition-all duration-300 ease-out ${
                  open ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
                }`}
              />
              <IconClose
                className={`absolute size-5 transition-all duration-300 ease-out ${
                  open ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
                }`}
              />
            </span>
          </button>
        </div>
      </div>

      {isVisible ? (
        <>
          {/* Backdrop overlay */}
          <div
            className={`fixed inset-0 top-14 z-40 bg-black/20 backdrop-blur-sm transition-opacity duration-300 sm:top-16 lg:hidden ${
              isAnimating ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={closeMenu}
            aria-hidden="true"
          />

          {/* Menu panel */}
          <div
            className={`absolute left-0 right-0 top-full z-50 origin-top border-t border-zinc-200/80 bg-white/98 shadow-xl backdrop-blur-md transition-all duration-300 ease-out lg:hidden ${
              isAnimating
                ? 'translate-y-0 scale-y-100 opacity-100'
                : '-translate-y-2 scale-y-95 opacity-0'
            }`}
          >
            <nav id={menuId} className="mx-auto max-w-7xl px-4 py-4" aria-label="Mobile navigation">
              <ul className="space-y-1">
                {NAV_LINKS.map((link, index) => {
                  const active = isLinkActive(link.href)

                  return (
                    <li
                      key={link.href}
                      className="mobile-menu-item"
                      style={{
                        animationDelay: isAnimating ? `${index * 50}ms` : '0ms',
                      }}
                    >
                      <Link
                        href={link.href}
                        aria-current={active ? 'page' : undefined}
                        className={`block rounded-xl px-4 py-3.5 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                          active
                            ? 'bg-primary-soft font-semibold text-heading'
                            : 'text-zinc-700 hover:bg-zinc-50 hover:text-heading'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </li>
                  )
                })}
              </ul>

              <div
                className="mobile-menu-item mt-4"
                style={{
                  animationDelay: isAnimating ? `${NAV_LINKS.length * 50}ms` : '0ms',
                }}
              >
                <a
                  href={site.contact.whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={closeMenu}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-success px-4 py-3.5 text-base font-semibold text-success-foreground shadow-sm transition hover:bg-success-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-success focus-visible:ring-offset-2"
                >
                  <BsWhatsapp className="size-5 shrink-0" aria-hidden="true" />
                  {site.contact.whatsappNavLabel}
                </a>
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </header>
  )
}
