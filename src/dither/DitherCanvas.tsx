import { useEffect, useMemo, useRef } from 'react'
import { useReducedMotion } from '../hooks'
import { paint, toPalette } from './paint'
import type { Field } from './paint'
import { COVER_PALETTE } from './palette'

type Props = {
  field: Field
  /** Resolution in dither cells; CSS scales the canvas up with crisp pixels. */
  width: number
  height: number
  /** Animate while true; otherwise one still frame is drawn. */
  play?: boolean
  /** Time (s) of the first frame, so still covers can start on an interesting pose. */
  startAt?: number
  palette?: readonly string[]
  className?: string
  /** Accessible description. Without one the canvas is treated as decoration. */
  label?: string
}

export function DitherCanvas({ field, width, height, play = false, startAt = 0, palette = COVER_PALETTE, className, label }: Props) {
  const ref = useRef<HTMLCanvasElement>(null)
  const time = useRef(startAt)
  const reduced = useReducedMotion()
  const colors = useMemo(() => toPalette(palette), [palette])

  useEffect(() => {
    const ctx = ref.current?.getContext('2d')
    if (!ctx) return
    const image = ctx.createImageData(width, height)
    const frame = () => {
      paint(image, field, time.current, colors)
      ctx.putImageData(image, 0, 0)
    }
    frame()
    if (!play || reduced) return

    let raf = 0
    let prev = performance.now()
    const loop = (now: number) => {
      time.current += Math.min(0.1, (now - prev) / 1000)
      prev = now
      frame()
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [field, width, height, play, reduced, colors])

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      className={['dither-canvas', className].filter(Boolean).join(' ')}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  )
}
