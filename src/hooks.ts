import { useEffect, useMemo, useRef, useState } from 'react'

const REDUCED = '(prefers-reduced-motion: reduce)'

export const prefersReducedMotion = () => typeof window !== 'undefined' && window.matchMedia(REDUCED).matches

export function useReducedMotion() {
  const [reduced, setReduced] = useState(prefersReducedMotion)
  useEffect(() => {
    const mq = window.matchMedia(REDUCED)
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

/** True while the element is on screen. Pass `once` to latch after the first sighting. */
export function useInView<T extends Element>({ rootMargin = '0px 0px -15% 0px', once = false } = {}) {
  const ref = useRef<T>(null)
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      setInView(true)
      return
    }
    const io = new IntersectionObserver(([entry]) => {
      if (once && entry.isIntersecting) io.disconnect()
      if (!once || entry.isIntersecting) setInView(entry.isIntersecting)
    }, { rootMargin })
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin, once])
  return [ref, inView] as const
}

export function useActiveSection(ids: readonly string[]) {
  const [active, setActive] = useState<string | null>(null)
  useEffect(() => {
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[]
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setActive(e.target.id)
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )
    els.forEach((el) => io.observe(el))
    const onScroll = () => {
      if (window.scrollY < 200) setActive(null)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('scroll', onScroll)
    }
  }, [ids])
  return active
}

/** True when `timeZone` is an IANA zone name this browser knows, e.g. 'Europe/Lisbon'. */
export function isTimeZone(timeZone: string) {
  if (!timeZone) return false
  try {
    new Intl.DateTimeFormat('en', { timeZone })
    return true
  } catch {
    return false
  }
}

/** The offset from UTC in `timeZone` at `at`, e.g. 'UTC+3', 'UTC-4' or 'UTC+5:30'. Empty if unknown. */
export function utcOffset(timeZone: string, at = new Date()) {
  if (!isTimeZone(timeZone)) return ''
  try {
    const name = new Intl.DateTimeFormat('en-US', { timeZone, timeZoneName: 'shortOffset' })
      .formatToParts(at)
      .find((p) => p.type === 'timeZoneName')?.value
    return name ? name.replace('GMT', 'UTC') : ''
  } catch {
    return ''
  }
}

/**
 * Local time (HH:MM) and UTC offset in `timeZone`, updated on the minute.
 * Both are empty strings when the zone is empty or unknown.
 */
export function useClock(timeZone: string) {
  const valid = isTimeZone(timeZone)
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    if (!valid) return
    let t = 0
    const next = () => 60_000 - (Date.now() % 60_000) + 50
    const tick = () => {
      setNow(new Date())
      t = window.setTimeout(tick, next())
    }
    t = window.setTimeout(tick, next())
    return () => window.clearTimeout(t)
  }, [valid])
  const fmt = useMemo(
    () => (valid ? new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', hour12: false }) : null),
    [timeZone, valid],
  )
  return { time: fmt ? fmt.format(now) : '', offset: valid ? utcOffset(timeZone, now) : '' }
}

export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)
