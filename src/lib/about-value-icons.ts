import {
  IconBookOpen,
  IconCalendar,
  IconCheck,
  IconInfo,
  IconLock,
  IconMapPin,
  IconStar,
  IconWhatsApp,
} from '@/components/icons'
import type { SiteAboutIconKey } from '@/lib/site-config.types'
import type { ComponentType, SVGProps } from 'react'

export const SITE_ABOUT_ICON_KEYS = [
  'calendar',
  'book',
  'whatsapp',
  'check',
  'lock',
  'star',
  'info',
  'map',
] as const satisfies readonly SiteAboutIconKey[]

export const SITE_ABOUT_ICON_LABELS: Record<SiteAboutIconKey, string> = {
  calendar: 'Calendar',
  book: 'Book / guide',
  whatsapp: 'WhatsApp / support',
  check: 'Checkmark',
  lock: 'Secure lock',
  star: 'Star',
  info: 'Information',
  map: 'Map pin',
}

type AboutIconConfig = {
  Icon: ComponentType<SVGProps<SVGSVGElement> & { className?: string }>
  iconClassName: string
  backgroundClassName: string
}

export const ABOUT_VALUE_ICON_CONFIG: Record<SiteAboutIconKey, AboutIconConfig> = {
  calendar: {
    Icon: IconCalendar,
    iconClassName: 'text-primary',
    backgroundClassName: 'bg-primary-soft',
  },
  book: {
    Icon: IconBookOpen,
    iconClassName: 'text-violet-600',
    backgroundClassName: 'bg-violet-50',
  },
  whatsapp: {
    Icon: IconWhatsApp,
    iconClassName: 'text-success',
    backgroundClassName: 'bg-success-soft',
  },
  check: {
    Icon: IconCheck,
    iconClassName: 'text-success',
    backgroundClassName: 'bg-success-soft',
  },
  lock: {
    Icon: IconLock,
    iconClassName: 'text-sky-600',
    backgroundClassName: 'bg-sky-50',
  },
  star: {
    Icon: IconStar,
    iconClassName: 'text-primary',
    backgroundClassName: 'bg-primary-soft',
  },
  info: {
    Icon: IconInfo,
    iconClassName: 'text-secondary',
    backgroundClassName: 'bg-secondary-soft',
  },
  map: {
    Icon: IconMapPin,
    iconClassName: 'text-secondary',
    backgroundClassName: 'bg-secondary-soft',
  },
}

export function isSiteAboutIconKey(value: unknown): value is SiteAboutIconKey {
  return typeof value === 'string' && value in ABOUT_VALUE_ICON_CONFIG
}

export function resolveSiteAboutIconKey(
  value: unknown,
  fallback: SiteAboutIconKey,
): SiteAboutIconKey {
  return isSiteAboutIconKey(value) ? value : fallback
}
