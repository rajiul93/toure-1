import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'

dayjs.extend(customParseFormat)
dayjs.extend(relativeTime)
dayjs.extend(utc)

export const DATE_INPUT_FORMAT = 'YYYY-MM-DD'

export function todayInputValue(): string {
  return dayjs().format(DATE_INPUT_FORMAT)
}

export function isValidInputDate(value: string): boolean {
  return dayjs(value, DATE_INPUT_FORMAT, true).isValid()
}

export function parseInputDate(value: string) {
  return dayjs(value, DATE_INPUT_FORMAT, true)
}

export function formatBlogDisplayDate(value: string): string {
  const parsed = parseInputDate(value)
  if (!parsed.isValid()) return value
  return parsed.format('D MMMM YYYY')
}

export function formatAdminDateTime(value: string | Date): string {
  return dayjs(value).format('D MMM YYYY')
}

/** e.g. "2 hours ago" — for admin lists where recency matters more than the exact date. */
export function formatRelativeTime(value: string | Date): string {
  const parsed = dayjs(value)
  if (!parsed.isValid()) return ''
  return parsed.fromNow()
}

export function toDate(value: string): Date {
  return parseInputDate(value).toDate()
}

export { dayjs }
