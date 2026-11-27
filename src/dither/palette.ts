/** Colours shared by the WebGL background, the canvas covers and the CSS tokens in styles/tokens.css. */
export type RGB = readonly [number, number, number]

export function hexToRgb(hex: string): RGB {
  const h = hex.replace('#', '')
  const v = parseInt(h.length === 3 ? [...h].map((c) => c + c).join('') : h, 16)
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255]
}

/** Darkest → brightest. The last level is the accent and only shows at the peaks. */
export const BACKGROUND_PALETTE = ['#0a0a0b', '#1f1f24', '#5f5e66', '#ff5a1f'] as const
export const COVER_PALETTE = ['#0d0d10', '#26262c', '#8b8a93', '#ff5a1f'] as const
