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

/**
 * Fades in every `[data-reveal]` element the first time it scrolls into view.
 * Elements rendered later (e.g. after GitHub data arrives) are picked up too.
 */
export function useRevealOnScroll() {
  useEffect(() => {
    const root = document.documentElement
    if (!('IntersectionObserver' in window)) return
    root.classList.add('can-reveal')
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue
          e.target.classList.add('is-in')
          io.unobserve(e.target)
        }
      },
      { rootMargin: '0px 0px -8% 0px' },
    )
    const observe = () => document.querySelectorAll('[data-reveal]:not(.is-in)').forEach((el) => io.observe(el))
    observe()
    const mo = new MutationObserver(observe)
    mo.observe(document.body, { childList: true, subtree: true })
    return () => {
      io.disconnect()
      mo.disconnect()
      root.classList.remove('can-reveal')
    }
  }, [])
}

const GLYPHS = '#%&*+=<>/\\[]{}01_'

/** "Decodes" text from random glyphs, left to right. Returns the final text for reduced motion. */
export function useScramble(text: string, play: boolean, duration = 650) {
  const reduced = useReducedMotion()
  const [out, setOut] = useState(text)
  useEffect(() => {
    if (!play || reduced) {
      setOut(text)
      return
    }
    let raf = 0
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      const fixed = Math.floor(p * text.length)
      let s = text.slice(0, fixed)
      for (let i = fixed; i < text.length; i++) s += text[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0]
      setOut(s)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [text, play, reduced, duration])
  return out
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
