import { ABOUT_VALUE_ICON_CONFIG, resolveSiteAboutIconKey } from '@/lib/about-value-icons'
import type { SiteAboutIconKey } from '@/lib/site-config.types'

export default function AboutValueIcon({ icon }: { icon: SiteAboutIconKey | undefined }) {
  const resolvedIcon = resolveSiteAboutIconKey(icon, 'calendar')
  const { Icon, iconClassName, backgroundClassName } = ABOUT_VALUE_ICON_CONFIG[resolvedIcon]

  return (
    <span
      className={`inline-flex size-11 shrink-0 items-center justify-center rounded-2xl ${backgroundClassName}`}
      aria-hidden="true"
    >
      <Icon className={`size-5 ${iconClassName}`} />
    </span>
  )
}
