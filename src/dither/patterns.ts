import type { Field } from './paint'

/**
 * Generative fields for the project covers. Each one is a pure function of
 * position and time, so it can be rendered at any size and animated for free.
 */

const { sin, cos, exp, sqrt, abs, max, min, PI } = Math
const fract = (x: number) => x - Math.floor(x)
const smooth = (a: number, b: number, x: number) => {
  const t = min(1, max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** A lit sphere with a slowly orbiting light and a soft floor shadow. */
export const orb: Field = (u, v, t, aspect) => {
  const R = 0.36
  const dx = (u - aspect / 2) / R
  const dy = (v - 0.47) / R
  const r2 = dx * dx + dy * dy
  if (r2 < 1) {
    const nz = sqrt(1 - r2)
    const a = t * 0.5 - 0.6
    const lx = cos(a) * 0.75
    const ly = -0.5
    const lz = 0.45 + 0.25 * sin(a)
    const len = sqrt(lx * lx + ly * ly + lz * lz)
    const diffuse = max(0, (dx * lx + dy * ly + nz * lz) / len)
    const latitude = 0.06 * smooth(0.82, 1, abs(sin(dy * PI * 4 + t * 0.4)))
    return 0.05 + 0.82 * diffuse ** 1.4 + 0.3 * diffuse ** 24 - latitude
  }
  const shadow = 0.3 * exp(-((u - aspect / 2) ** 2) * 7 - (v - 0.9) ** 2 * 120)
  return shadow + 0.12 * exp(-(r2 - 1) * 2.5)
}

/** Contour lines over rolling dunes, like a topographic map. */
export const dunes: Field = (u, v, t) => {
  const h = v * 34 - t * 1.2 + 2.2 * sin(u * 3.1 + t * 0.4) + 1.3 * sin(u * 7.3 - t * 0.7)
  const band = (0.5 + 0.5 * sin(h)) ** 3
  const glow = 0.55 * exp(-((u - 1.25) ** 2) * 5 - (v - 0.3) ** 2 * 9)
  return band * (0.2 + 0.75 * v) + glow * band + 0.04
}

/** Two point sources interfering, like ripples on water. */
export const ripples: Field = (u, v, t, aspect) => {
  const d1 = sqrt((u - aspect * 0.32) ** 2 + (v - 0.42) ** 2)
  const d2 = sqrt((u - aspect * 0.7) ** 2 + (v - 0.62) ** 2)
  const wave = 0.5 + 0.25 * (sin(d1 * 46 - t * 2.4) + sin(d2 * 46 - t * 2.4))
  return wave * wave * exp(-min(d1, d2) * 1.6) * 1.25
}

/** A sun over a perspective grid floor that scrolls towards the viewer. */
export const horizon: Field = (u, v, t, aspect) => {
  const H = 0.5
  const cx = aspect / 2
  if (v < H) {
    const r = 0.26
    const d = sqrt((u - cx) ** 2 + (v - (H - 0.02)) ** 2)
    if (d < r) {
      const k = (v - (H - 0.02 - r)) / r // 0 at the top of the sun, 1 at the horizon
      const cut = fract(k * 6 - t * 0.35) < k * 0.55
      return cut ? 0.05 : 0.55 + 0.45 * (1 - k)
    }
    return 0.04 + 0.3 * exp(-(d - r) * 7)
  }
  const z = 0.1 / (v - H + 0.002)
  const x = (u - cx) * z
  const gx = smooth(0.42, 0.5, abs(fract(x * 1.4) - 0.5))
  const gz = smooth(0.4, 0.5, abs(fract(z * 0.9 + t * 0.6) - 0.5))
  return max(gx, gz) * exp(-z * 0.18) + 0.03
}

export const patterns = { orb, dunes, ripples, horizon } satisfies Record<string, Field>
export type PatternName = keyof typeof patterns

/**
 * Turn a loaded image into a field (cover-fit, Rec. 709 luma) so a photo can be
 * dithered with the same renderer. `contrast` > 1 pushes mid-tones apart.
 */
export function imageField(img: CanvasImageSource & { width: number; height: number }, w: number, h: number, contrast = 1.25): Field {
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return () => 0
  const scale = max(w / img.width, h / img.height)
  const dw = img.width * scale
  const dh = img.height * scale
  ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh)
  const { data } = ctx.getImageData(0, 0, w, h)
  const luma = new Float32Array(w * h)
  for (let i = 0; i < luma.length; i++) {
    const y = (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255
    luma[i] = (y - 0.5) * contrast + 0.5
  }
  return (u, v, _t, aspect) => {
    const x = min(w - 1, max(0, Math.round((u / aspect) * (w - 1))))
    const y = min(h - 1, max(0, Math.round(v * (h - 1))))
    return luma[y * w + x]
  }
}
