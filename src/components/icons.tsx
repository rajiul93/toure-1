import type { ReactNode, SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & {
  className?: string
}

function IconBase({ className, children, ...props }: IconProps & { children: ReactNode }) {
  return (
    <svg viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true" {...props}>
      {children}
    </svg>
  )
}

export function IconChevronDown({ className, ...props }: IconProps) {
  return (
    <IconBase className={className} stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 8l5 5 5-5" />
    </IconBase>
  )
}

export function IconChevronUp({ className, ...props }: IconProps) {
  return (
    <IconBase className={className} stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12l5-5 5 5" />
    </IconBase>
  )
}

export function IconChevronLeft({ className, ...props }: IconProps) {
  return (
    <IconBase className={className} stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12.5 15 7.5 10l5-5" />
    </IconBase>
  )
}

export function IconChevronRight({ className, ...props }: IconProps) {
  return (
    <IconBase className={className} stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 15 12.5 10 7.5 5" />
    </IconBase>
  )
}

export function IconSearch({ className, ...props }: IconProps) {
  return (
    <IconBase className={className} stroke="currentColor" strokeWidth="1.75" {...props}>
      <circle cx="9" cy="9" r="5.25" />
      <path strokeLinecap="round" d="M13.5 13.5 17 17" />
    </IconBase>
  )
}

export function IconCalendar({ className, ...props }: IconProps) {
  return (
    <IconBase className={className} stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3.5" y="4.5" width="13" height="12" rx="1.5" />
      <path strokeLinecap="round" d="M3.5 8.5h13M7 3v3M13 3v3" />
    </IconBase>
  )
}

export function IconX({ className, ...props }: IconProps) {
  return (
    <IconBase className={className} stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" d="M6 6l8 8M14 6l-8 8" />
    </IconBase>
  )
}

export function IconWhatsApp({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true" {...props}>
      <path d="M10 2a8 8 0 00-6.87 12.03L2 18l4.08-1.07A8 8 0 1010 2zm0 1.5a6.5 6.5 0 014.5 11.18l.32.3-.12 1.38-1.34-.35-.33.19a6.47 6.47 0 01-3.03.75 6.5 6.5 0 116.5-6.5v.33z" />
      <path d="M8.2 7.4c-.17-.38-.35-.39-.51-.4h-.44c-.16 0-.42.06-.64.3-.22.25-.84.82-.84 2s.86 2.33.98 2.49c.12.17 1.67 2.67 4.1 3.63.58.22 1.03.35 1.38.45.58.18 1.1.15 1.52.09.46-.07 1.42-.58 1.62-1.14.2-.56.2-1.04.14-1.14-.06-.1-.22-.16-.46-.28-.24-.12-1.42-.7-1.64-.78-.22-.08-.38-.12-.54.12-.16.25-.62.78-.76.94-.14.16-.28.18-.52.06-.24-.12-1.01-.37-1.93-1.18-.71-.63-1.2-1.41-1.34-1.65-.14-.24-.01-.37.1-.49.1-.1.24-.26.36-.39.12-.13.16-.22.24-.37.08-.15.04-.28-.02-.39-.06-.12-.54-1.3-.74-1.78z" />
    </svg>
  )
}

export function IconMapPin({ className, ...props }: IconProps) {
  return (
    <IconBase className={className} stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10 17s-5-4.5-5-9a5 5 0 1110 0c0 4.5-5 9-5 9z" />
      <circle cx="10" cy="8" r="1.75" fill="currentColor" stroke="none" />
    </IconBase>
  )
}

export function IconExternalLink({ className, ...props }: IconProps) {
  return (
    <IconBase className={className} stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11 4h4v4M8 12l7-7M6 6H5a1 1 0 00-1 1v8a1 1 0 001 1h8a1 1 0 001-1v-1" />
    </IconBase>
  )
}

export function IconBookOpen({ className, ...props }: IconProps) {
  return (
    <IconBase className={className} stroke="currentColor" strokeWidth="1.5" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5.5A1.5 1.5 0 014.5 4H10v12H4.5A1.5 1.5 0 013 14.5V5.5zM10 4h5.5A1.5 1.5 0 0117 5.5v9A1.5 1.5 0 0115.5 16H10" />
    </IconBase>
  )
}

export function IconGrid({ className, ...props }: IconProps) {
  return (
    <IconBase className={className} stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="3.5" y="3.5" width="5" height="5" rx="1" />
      <rect x="11.5" y="3.5" width="5" height="5" rx="1" />
      <rect x="3.5" y="11.5" width="5" height="5" rx="1" />
      <rect x="11.5" y="11.5" width="5" height="5" rx="1" />
    </IconBase>
  )
}

export function IconInfo({ className, ...props }: IconProps) {
  return (
    <IconBase className={className} stroke="currentColor" strokeWidth="1.5" {...props}>
      <circle cx="10" cy="10" r="7.25" />
      <path strokeLinecap="round" d="M10 9v5M10 7h.01" />
    </IconBase>
  )
}

export function IconCheck({ className, ...props }: IconProps) {
  return (
    <IconBase className={className} stroke="currentColor" strokeWidth="2" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5.5 10 8.5 13 14.5 6.5" />
    </IconBase>
  )
}

export function IconStar({ className, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className={className} aria-hidden="true" {...props}>
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

export function IconMenu({ className, ...props }: IconProps) {
  return (
    <IconBase className={className} stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" d="M4 6h12M4 10h12M4 14h12" />
    </IconBase>
  )
}

export function IconClose({ className, ...props }: IconProps) {
  return (
    <IconBase className={className} stroke="currentColor" strokeWidth="1.75" {...props}>
      <path strokeLinecap="round" d="M6 6l8 8M14 6l-8 8" />
    </IconBase>
  )
}

export function IconLock({ className, ...props }: IconProps) {
  return (
    <IconBase className={className} stroke="currentColor" strokeWidth="1.5" {...props}>
      <rect x="5" y="9" width="10" height="7" rx="1.5" />
      <path strokeLinecap="round" d="M7 9V7a3 3 0 116 0v2" />
    </IconBase>
  )
}

export function IconSpinner({ className }: { className?: string }) {
  return (
    <span
      className={`inline-block size-4 animate-spin rounded-full border-2 border-white/40 border-t-white ${className ?? ''}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading…</span>
    </span>
  )
}
