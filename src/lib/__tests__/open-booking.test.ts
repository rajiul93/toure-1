import {
  BOOKING_OPEN_EVENT,
  getVisibleBookingTarget,
  openBookingCalendar,
} from '@/lib/open-booking'

function mountBooking({ hidden }: { hidden: boolean }) {
  document.body.innerHTML = `<div id="book">sidebar</div>`
  const el = document.getElementById('book') as HTMLElement

  // jsdom does not do layout, so emulate what display:none produces.
  Object.defineProperty(el, 'offsetParent', {
    configurable: true,
    get: () => (hidden ? null : document.body),
  })
  el.getClientRects = (() =>
    hidden ? ([] as unknown as DOMRectList) : ([{}] as unknown as DOMRectList)) as HTMLElement['getClientRects']

  return el
}

beforeAll(() => {
  window.matchMedia = ((query: string) => ({
    matches: false,
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
    onchange: null,
    dispatchEvent: jest.fn(),
  })) as unknown as typeof window.matchMedia
  window.scrollTo = jest.fn() as unknown as typeof window.scrollTo
})

beforeEach(() => {
  document.body.innerHTML = ''
  jest.clearAllMocks()
})

describe('getVisibleBookingTarget', () => {
  it('returns null when the sidebar is not in the DOM at all', () => {
    expect(getVisibleBookingTarget()).toBeNull()
  })

  it('returns the element when the sidebar is visible (home, blog, reviews)', () => {
    const el = mountBooking({ hidden: false })
    expect(getVisibleBookingTarget()).toBe(el)
  })

  it('returns null when the sidebar is mounted but display:none (/about-us, /legal/*)', () => {
    // This is the regression: the element exists, so the old
    // `document.getElementById('book')` check wrongly reported it as usable.
    mountBooking({ hidden: true })
    expect(document.getElementById('book')).not.toBeNull()
    expect(getVisibleBookingTarget()).toBeNull()
  })
})

describe('openBookingCalendar', () => {
  it('scrolls and fires the open event when the sidebar is visible', () => {
    mountBooking({ hidden: false })
    const onOpen = jest.fn()
    window.addEventListener(BOOKING_OPEN_EVENT, onOpen)

    openBookingCalendar()

    expect(window.scrollTo).toHaveBeenCalled()
    expect(onOpen).toHaveBeenCalledTimes(1)
    window.removeEventListener(BOOKING_OPEN_EVENT, onOpen)
  })

  it('does nothing when the sidebar is hidden, so the caller can navigate instead', () => {
    mountBooking({ hidden: true })
    const onOpen = jest.fn()
    window.addEventListener(BOOKING_OPEN_EVENT, onOpen)

    openBookingCalendar()

    expect(window.scrollTo).not.toHaveBeenCalled()
    expect(onOpen).not.toHaveBeenCalled()
    window.removeEventListener(BOOKING_OPEN_EVENT, onOpen)
  })
})
