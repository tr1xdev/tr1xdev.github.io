import { bayer } from './bayer'
import { hexToRgb } from './palette'
import type { RGB } from './palette'

/**
 * A brightness field. `u` and `v` are aspect-corrected coordinates (v runs 0..1 from the top,
 * u runs 0..aspect from the left); `t` is time in seconds. Return 0 (darkest) to 1 (brightest).
 */
export type Field = (u: number, v: number, t: number, aspect: number) => number

const M = bayer(4)

/** Ordered-dither `field` into `image` using the given palette (darkest first). */
export function paint(image: ImageData, field: Field, t: number, palette: readonly RGB[]) {
  const { width: w, height: h, data } = image
  const levels = palette.length - 1
  const aspect = w / h
  for (let y = 0; y < h; y++) {
    const v = y / (h - 1)
    for (let x = 0; x < w; x++) {
      const raw = field((x / (w - 1)) * aspect, v, t, aspect)
      const value = raw <= 0 ? 0 : raw >= 1 ? 1 : raw
      const level = Math.min(levels, Math.floor(value * levels + M[(y & 3) * 4 + (x & 3)]))
      const [r, g, b] = palette[level]
      const o = (y * w + x) * 4
      data[o] = r
      data[o + 1] = g
      data[o + 2] = b
      data[o + 3] = 255
    }
  }
}

export const toPalette = (hex: readonly string[]): RGB[] => hex.map(hexToRgb)
