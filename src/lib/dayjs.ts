import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import utc from 'dayjs/plugin/utc'

dayjs.extend(customParseFormat)
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

export function toDate(value: string): Date {
  return parseInputDate(value).toDate()
}

export { dayjs }
