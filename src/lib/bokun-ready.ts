/**
 * Readiness detection for the embedded Bókun calendar widget.
 *
 * Bókun's loader replaces a `.bokunWidget[data-src]` node with a cross-origin
 * iframe. Nothing in that flow tells us when the calendar is actually usable,
 * so this watcher combines several independent signals and reports phase
 * transitions to the caller.
 *
 * Deliberately framework-agnostic: a plain factory rather than a React hook, so
 * the state machine can be driven by a bare DOM harness and stays neutral
 * toward the React Compiler.
 */

export type BokunCalendarPhase = 'idle' | 'loading' | 'delayed' | 'failed' | 'ready'
export type BokunReadyReason = 'iframe-load' | 'bokun-message' | 'interactive-dom'
export type BokunFailureCause = 'timeout' | 'iframe-error' | 'offline' | 'loader-error'

export type BokunWatcherEvent =
  | { phase: 'loading'; attempt: number }
  | { phase: 'delayed'; attempt: number; elapsedMs: number }
  | { phase: 'failed'; attempt: number; elapsedMs: number; cause: BokunFailureCause }
  | { phase: 'ready'; attempt: number; elapsedMs: number; reason: BokunReadyReason }

export type BokunWatcherOptions = {
  /** The `.bokunWidget[data-src]` node Bókun hydrates into an iframe. */
  container: HTMLElement
  attempt?: number
  onPhase: (event: BokunWatcherEvent) => void
  requestScan?: () => boolean
  now?: () => number
  softDelayMs?: number
  hardFailMs?: number
  pollMs?: number
}

export type BokunWatcherHandle = {
  getPhase: () => BokunCalendarPhase
  getElapsedMs: () => number
  /** Force an immediate re-inspection. */
  inspect: () => void
  /** Idempotent teardown of every observer, timer, listener and pending frame. */
  stop: () => void
}

export const BOKUN_SOFT_DELAY_MS = 6500
export const BOKUN_HARD_FAIL_MS = 18000
export const BOKUN_POLL_MS = 350
/** Clamps a single tick so a slept laptop or throttled tab can't burn the budget. */
export const BOKUN_MAX_TICK_DELTA_MS = 1500
export const BOKUN_MIN_IFRAME_WIDTH = 200
/** Guards against a collapsed placeholder; readiness also needs a live message. */
export const BOKUN_MIN_IFRAME_HEIGHT = 120
export const BOKUN_MIN_FALLBACK_HEIGHT = 180
export const BOKUN_MIN_INTERACTIVE_HEIGHT = 24

const INTERACTIVE_SELECTOR =
  'form, button:not([disabled]), select:not([disabled]), input:not([disabled]), [role="button"]'

type BokunWindow = Window & {
  /** What the current SDK actually exposes — verified against the live loader. */
  initializeBokunWidgets?: () => void
  /** Never present in the shipped SDK; kept only as a defensive fallback. */
  BokunWidgetsLoader?: {
    loadWidgets?: () => void
    init?: () => void
  }
}

/**
 * Asks Bókun's loader to (re)scan the document for unhydrated widget nodes.
 * Returns whether a scan entry point was actually found, so callers can tell a
 * real rescan apart from a silent no-op.
 */
export function requestBokunWidgetScan(): boolean {
  mark('bokun:scan')
  const w = window as BokunWindow

  if (typeof w.initializeBokunWidgets === 'function') {
    w.initializeBokunWidgets()
    return true
  }

  const loader = w.BokunWidgetsLoader
  if (loader?.loadWidgets || loader?.init) {
    loader.loadWidgets?.()
    loader.init?.()
    return true
  }

  return false
}

/**
 * Whether a `MessageEvent.origin` belongs to Bókun. Callers must never read
 * `event.data` — the message is used only as a boolean liveness signal, so a
 * spoofed one can at worst contribute a proof, never execute anything.
 */
export function isBokunOrigin(origin: string): boolean {
  try {
    const url = new URL(origin)
    if (url.protocol !== 'https:') return false
    return url.hostname === 'bokun.io' || url.hostname.endsWith('.bokun.io')
  } catch {
    return false
  }
}

/**
 * Uses offset dimensions rather than `getBoundingClientRect` so the result is
 * immune to CSS transforms and reports 0 under a `display:none` ancestor.
 */
export function hasUsableSize(
  node: HTMLElement | null,
  minHeight: number,
  minWidth = 0,
): boolean {
  if (!node) return false
  return node.offsetWidth >= minWidth && node.offsetHeight >= minHeight
}

/**
 * Whether the node currently participates in layout. `checkVisibility` ignores
 * opacity by default, which is what we want — the collapsed widget is
 * `opacity-0` but still loading.
 */
export function isRenderable(node: HTMLElement): boolean {
  if (!node.isConnected) return false
  if (typeof node.checkVisibility === 'function') return node.checkVisibility()
  return node.offsetWidth > 0 || node.offsetHeight > 0
}

function mark(name: string, detail?: unknown) {
  try {
    performance.mark(name, detail === undefined ? undefined : { detail })
  } catch {
    // performance.mark with options is unsupported on older Safari.
  }
}

export function startBokunCalendarWatch({
  container,
  attempt = 0,
  onPhase,
  requestScan = requestBokunWidgetScan,
  now = () => performance.now(),
  softDelayMs = BOKUN_SOFT_DELAY_MS,
  hardFailMs = BOKUN_HARD_FAIL_MS,
  pollMs = BOKUN_POLL_MS,
}: BokunWatcherOptions): BokunWatcherHandle {
  let phase: BokunCalendarPhase = 'idle'
  let elapsedMs = 0
  let lastTickAt = now()
  let stopped = false
  let bokunMessageSeen = false

  let mutationObserver: MutationObserver | null = null
  let resizeObserver: ResizeObserver | null = null
  let observedIframe: HTMLIFrameElement | null = null
  let pollId: number | null = null
  let frameId: number | null = null

  mark('bokun:attempt-start', { attempt })

  const emit = (event: BokunWatcherEvent) => {
    phase = event.phase
    onPhase(event)
  }

  const stop = () => {
    if (stopped) return
    stopped = true

    mutationObserver?.disconnect()
    resizeObserver?.disconnect()
    mutationObserver = null
    resizeObserver = null
    observedIframe = null

    if (pollId !== null) window.clearInterval(pollId)
    if (frameId !== null) cancelAnimationFrame(frameId)
    pollId = null
    frameId = null

    window.removeEventListener('message', onMessage)
    window.removeEventListener('online', onOnline)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  }

  const markReady = (reason: BokunReadyReason) => {
    if (stopped || phase === 'ready' || phase === 'failed') return

    // Two frames of breathing room so the iframe has actually painted, rather
    // than merely having fired `load` for its initial document.
    frameId = requestAnimationFrame(() => {
      frameId = requestAnimationFrame(() => {
        frameId = null
        if (stopped || phase === 'ready' || phase === 'failed') return
        mark('bokun:ready', { attempt, reason, elapsedMs })
        try {
          performance.measure('bokun:time-to-ready', 'bokun:attempt-start', 'bokun:ready')
        } catch {
          // Marks may have been cleared; the measure is diagnostic only.
        }
        const event: BokunWatcherEvent = { phase: 'ready', attempt, elapsedMs, reason }
        stop()
        emit(event)
      })
    })
  }

  const fail = (cause: BokunFailureCause) => {
    if (stopped || phase === 'ready' || phase === 'failed') return
    const event: BokunWatcherEvent = { phase: 'failed', attempt, elapsedMs, cause }
    stop()
    emit(event)
  }

  const bindIframeSignals = (iframe: HTMLIFrameElement) => {
    if (iframe.dataset.bokunReadyBound === '1') return
    iframe.dataset.bokunReadyBound = '1'

    // `load` is not proof of success for a cross-origin frame, but it is still
    // a good moment to re-check for the messages that are.
    iframe.addEventListener('load', () => inspect(), { once: true })
    iframe.addEventListener('error', () => fail('iframe-error'), { once: true })
  }

  const observeIframe = (iframe: HTMLIFrameElement) => {
    if (!resizeObserver || observedIframe === iframe) return
    // The collapsed wrapper has a fixed height, so only the iframe's own growth
    // signals progress.
    if (observedIframe) resizeObserver.unobserve(observedIframe)
    resizeObserver.observe(iframe)
    observedIframe = iframe
  }

  function inspect() {
    if (stopped || phase === 'ready' || phase === 'failed') return

    const iframe = container.querySelector('iframe')
    if (iframe) {
      bindIframeSignals(iframe)
      observeIframe(iframe)

      const src = iframe.getAttribute('src') ?? ''
      const remote = /^https:\/\//i.test(src)
      const sized = hasUsableSize(iframe, BOKUN_MIN_IFRAME_HEIGHT, BOKUN_MIN_IFRAME_WIDTH)

      // A cross-origin iframe fires `load` and keeps its CSS height even when
      // its navigation was aborted, so neither the load event nor the size can
      // tell a working calendar from a dead one. A message from inside the
      // frame is the only signal that actually discriminates — measured: 6 on
      // a healthy load, 0 when the iframe URL is blocked.
      if (remote && sized && bokunMessageSeen) markReady('bokun-message')

      // Never fall through to the DOM fallback while an iframe exists — it
      // would match Bókun's own loading chrome.
      return
    }

    const interactive = container.querySelector<HTMLElement>(INTERACTIVE_SELECTOR)
    if (
      interactive &&
      hasUsableSize(interactive, BOKUN_MIN_INTERACTIVE_HEIGHT, 40) &&
      hasUsableSize(container, BOKUN_MIN_FALLBACK_HEIGHT, BOKUN_MIN_IFRAME_WIDTH)
    ) {
      markReady('interactive-dom')
    }
  }

  function onMessage(event: MessageEvent) {
    if (!isBokunOrigin(event.origin)) return

    // Bókun also injects a cart bubble and a modal container elsewhere in the
    // document, and those post messages too. Only a message from *our* calendar
    // iframe proves the calendar itself is alive.
    const iframe = container.querySelector('iframe')
    if (!iframe || event.source !== iframe.contentWindow) return

    bokunMessageSeen = true
    inspect()
  }

  function onOnline() {
    inspect()
  }

  function onVisibilityChange() {
    // Skip the time spent hidden rather than counting it against the budget.
    lastTickAt = now()
    inspect()
  }

  const tick = () => {
    if (stopped) return

    const at = now()
    const delta = at - lastTickAt
    lastTickAt = at

    // Only accrue while the widget is genuinely on screen. On /about-us the
    // sidebar is `display:none`, and a wall-clock timer would otherwise reach
    // "failed" for a card nobody has seen.
    if (document.visibilityState === 'visible' && isRenderable(container)) {
      elapsedMs += Math.min(delta, BOKUN_MAX_TICK_DELTA_MS)
    }

    if (phase === 'loading' && elapsedMs >= softDelayMs) {
      emit({ phase: 'delayed', attempt, elapsedMs })
    }

    if (elapsedMs >= hardFailMs) {
      fail(navigator.onLine === false ? 'offline' : 'timeout')
      return
    }

    inspect()
  }

  emit({ phase: 'loading', attempt })
  requestScan()

  mutationObserver = new MutationObserver(() => inspect())
  mutationObserver.observe(container, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'style', 'class'],
  })

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => inspect())
    resizeObserver.observe(container)
  }

  window.addEventListener('message', onMessage)
  window.addEventListener('online', onOnline)
  document.addEventListener('visibilitychange', onVisibilityChange)

  pollId = window.setInterval(tick, pollMs)
  inspect()

  return {
    getPhase: () => phase,
    getElapsedMs: () => elapsedMs,
    inspect,
    stop,
  }
}
