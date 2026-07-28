import { toMonthDateTime } from '@/lib/dayjs'

/**
 * Review dates are stored for display only ("Jul 2026"). A `<time>` without a
 * machine-readable `dateTime` is invalid HTML, so emit `<time>` when the value
 * parses and fall back to a plain `<span>` when it doesn't.
 */
export default function ReviewDate({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  const dateTime = toMonthDateTime(value)

  if (!dateTime) {
    return <span className={className}>{value}</span>
  }

  return (
    <time dateTime={dateTime} className={className}>
      {value}
    </time>
  )
}
