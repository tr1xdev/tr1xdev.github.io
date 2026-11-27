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

/** Current time in a given IANA zone, ticking every second. */
export function useClock(timeZone: string, withSeconds = false) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(t)
  }, [])
  const fmt = useMemo(
    () =>
      new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        ...(withSeconds ? { second: '2-digit' } : {}),
        hour12: false,
      }),
    [timeZone, withSeconds],
  )
  return fmt.format(now)
}

export const isMac = typeof navigator !== 'undefined' && /Mac|iPhone|iPad/.test(navigator.userAgent)
