import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../hooks'
import { createDitherField } from './field'
import { BACKGROUND_PALETTE } from './palette'

/**
 * Fixed, full-viewport dithered backdrop. Reacts to the pointer and to scrolling,
 * pauses in background tabs, renders one still frame for reduced motion and
 * falls back to a CSS dot pattern when WebGL is unavailable.
 */
export function DitherBackground() {
  const ref = useRef<HTMLCanvasElement>(null)
  const reduced = useReducedMotion()
  const [supported, setSupported] = useState(true)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const field = createDitherField(canvas, { palette: BACKGROUND_PALETTE, cellSize: 3 })
    if (!field) {
      setSupported(false)
      return
    }

    const syncScroll = () => field.setScroll(window.scrollY / Math.max(1, window.innerHeight))
    syncScroll()
    field.resize()

    if (reduced) {
      field.render()
      const onResize = () => {
        field.resize()
        field.render()
      }
      window.addEventListener('resize', onResize)
      return () => {
        window.removeEventListener('resize', onResize)
        field.destroy()
      }
    }

    const onResize = () => field.resize()
    // Only a mouse gets the light; on touch screens it would just follow the scrolling thumb.
    const onMove = (e: PointerEvent) => e.pointerType === 'mouse' && field.setPointer(e.clientX, e.clientY)
    const onLeave = () => field.setPointer(null)
    const onVisibility = () => (document.hidden ? field.stop() : field.start())

    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', syncScroll, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    document.documentElement.addEventListener('pointerleave', onLeave)
    window.addEventListener('blur', onLeave)
    document.addEventListener('visibilitychange', onVisibility)
    if (!document.hidden) field.start()

    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', syncScroll)
      window.removeEventListener('pointermove', onMove)
      document.documentElement.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('blur', onLeave)
      document.removeEventListener('visibilitychange', onVisibility)
      field.destroy()
    }
  }, [reduced])

  return supported ? (
    <div className="dither-bg" aria-hidden="true">
      <canvas ref={ref} />
    </div>
  ) : (
    <div className="dither-bg dither-bg--static" aria-hidden="true" />
  )
}
