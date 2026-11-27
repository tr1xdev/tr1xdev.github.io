import { useEffect, useMemo, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { useReducedMotion } from '../hooks'
import { paint, toPalette } from './paint'
import type { Field } from './paint'
import { COVER_PALETTE } from './palette'

type Props = {
  field: Field
  /** Width / height of the frame. Ignored with `fill`, where CSS decides the height. */
  aspect?: number
  /** Let the frame take its height from CSS (e.g. `height: 100%`) instead of from `aspect`. */
  fill?: boolean
  /** Size of one dither cell in CSS pixels, snapped to whole device pixels. */
  cell?: number
  /** Animate while true; otherwise one still frame is drawn. */
  play?: boolean
  /** Time (s) of the first frame, so still covers can start on an interesting pose. */
  startAt?: number
  palette?: readonly string[]
  className?: string
  /** Accessible description. Without one the artwork is treated as decoration. */
  label?: string
}

const FRAME_MS = 1000 / 30 - 2

/**
 * A generative field dithered onto a canvas that exactly covers its frame: one canvas pixel per
 * dither cell, each cell a whole number of device pixels, so the pattern stays crisp at any
 * size and display scaling. Animates at up to 30 fps while `play` is true.
 */
export function DitherCanvas({ field, aspect = 16 / 9, fill = false, cell = 3, play = false, startAt = 0, palette = COVER_PALETTE, className, label }: Props) {
  const frame = useRef<HTMLSpanElement>(null)
  const ref = useRef<HTMLCanvasElement>(null)
  const time = useRef(startAt)
  const reduced = useReducedMotion()
  const colors = useMemo(() => toPalette(palette), [palette])
  const [size, setSize] = useState<{ w: number; h: number; css: number } | null>(null)

  // Measure the frame and pick a whole number of device pixels per cell.
  useEffect(() => {
    const el = frame.current
    if (!el) return
    const measure = () => {
      const dpr = window.devicePixelRatio || 1
      const css = Math.max(1, Math.round(cell * dpr)) / dpr
      const w = Math.max(1, Math.ceil(el.clientWidth / css))
      const h = Math.max(1, Math.ceil(el.clientHeight / css))
      setSize((s) => (s && s.w === w && s.h === h && s.css === css ? s : { w, h, css }))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [cell])

  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx || !size) return
    const image = ctx.createImageData(size.w, size.h)
    const draw = () => {
      paint(image, field, time.current, colors)
      ctx.putImageData(image, 0, 0)
    }
    draw()
    if (!play || reduced) return

    let raf = 0
    let prev = performance.now()
    let drawn = 0
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop)
      time.current += Math.min(0.1, (now - prev) / 1000)
      prev = now
      if (now - drawn < FRAME_MS) return
      drawn = now
      draw()
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [field, size, play, reduced, colors])

  const frameStyle: CSSProperties | undefined = fill ? undefined : { aspectRatio: String(aspect) }

  return (
    <span
      ref={frame}
      className={['dither-frame', className].filter(Boolean).join(' ')}
      style={frameStyle}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {size && <canvas ref={ref} width={size.w} height={size.h} style={{ width: size.w * size.css, height: size.h * size.css }} />}
    </span>
  )
}
