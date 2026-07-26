'use client'

import { useNavActive } from '@/hooks/use-nav-active'
import { NAV_LINKS } from '@/lib/nav-links'
import { motion, type Variants } from 'framer-motion'
import Link from 'next/link'

const itemVariants: Variants = {
  initial: { rotateX: 0, opacity: 1 },
  hover: { rotateX: -90, opacity: 0 },
}

const backVariants: Variants = {
  initial: { rotateX: 90, opacity: 0 },
  hover: { rotateX: 0, opacity: 1 },
}

const sharedTransition = {
  type: 'spring' as const,
  stiffness: 100,
  damping: 20,
  duration: 0.5,
}

type NavMenuItemProps = {
  href: string
  label: string
  active: boolean
}

function NavMenuItem({ href, label, active }: NavMenuItemProps) {
  const textClass = active
    ? 'font-semibold text-heading'
    : 'font-medium text-zinc-600 group-hover:text-heading'

  return (
    <motion.li className="relative">
      <Link
        href={href}
        aria-current={active ? 'page' : undefined}
        className="group relative block overflow-visible rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      >
        <motion.div
          style={{ perspective: '600px' }}
          whileHover="hover"
          initial="initial"
          className="relative"
        >
          <motion.span
            className={`relative z-10 block px-3 py-2 text-sm ${textClass}`}
            variants={itemVariants}
            transition={sharedTransition}
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: 'center bottom',
            }}
          >
            {label}
          </motion.span>

          <motion.span
            className={`absolute inset-0 z-10 flex items-center px-3 py-2 text-sm ${textClass}`}
            variants={backVariants}
            transition={sharedTransition}
            style={{
              transformStyle: 'preserve-3d',
              transformOrigin: 'center top',
              transform: 'rotateX(90deg)',
            }}
          >
            {label}
          </motion.span>

          {active ? (
            <span
              className="pointer-events-none absolute inset-x-2 bottom-0 z-20 h-0.5 rounded-full bg-primary"
              aria-hidden
            />
          ) : null}
        </motion.div>
      </Link>
    </motion.li>
  )
}

export default function NavMenuBar() {
  const { isLinkActive } = useNavActive()

  return (
    <nav aria-label="Main navigation">
      <ul className="flex items-center gap-0.5">
        {NAV_LINKS.map((item) => (
          <NavMenuItem
            key={item.href}
            href={item.href}
            label={item.label}
            active={isLinkActive(item.href)}
          />
        ))}
      </ul>
    </nav>
  )
}
