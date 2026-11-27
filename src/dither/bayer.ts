/**
 * Ordered-dither threshold matrices.
 *
 * A Bayer matrix of size n (a power of two) spreads the thresholds 0..n²-1 so that
 * neighbouring cells are as different as possible. Comparing a value against
 * `matrix[y % n][x % n]` instead of a flat 0.5 turns smooth gradients into the
 * familiar cross-hatched dot patterns.
 *
 * Built recursively: M(2n) = [[4M, 4M + 2], [4M + 3, 4M + 1]].
 */
export function bayer(n: number): Float32Array {
  if (n < 1 || (n & (n - 1)) !== 0) throw new Error(`bayer(): size must be a power of two, got ${n}`)
  let m = [0]
  let size = 1
  while (size < n) {
    const s2 = size * 2
    const next = new Array<number>(s2 * s2)
    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        const v = m[y * size + x] * 4
        next[y * s2 + x] = v
        next[y * s2 + x + size] = v + 2
        next[(y + size) * s2 + x] = v + 3
        next[(y + size) * s2 + x + size] = v + 1
      }
    }
    m = next
    size = s2
  }
  // Centre each threshold in its bucket so mid-grey dithers to an even 50 % pattern.
  return Float32Array.from(m, (v) => (v + 0.5) / (n * n))
}
