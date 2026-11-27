import { FRAG, VERT } from './shader'
import { hexToRgb } from './palette'

const FRAME_MS = 1000 / 30 - 2
/** Frames slower than this count as "struggling". */
const SLOW_MS = 55
const SLOW_FRAMES = 24
const MAX_CELL = 6

export type DitherFieldOptions = {
  /** Four colours, darkest to brightest. */
  palette: readonly [string, string, string, string]
  /** Size of one dither cell in CSS pixels. Bigger cells look chunkier and cost less. */
  cellSize?: number
}

/**
 * Framework-agnostic WebGL renderer for the dithered background.
 * The canvas is rendered at 1/cellSize of its CSS size and scaled up with
 * `image-rendering: pixelated`, so every dither cell stays a crisp square.
 */
export type DitherField = {
  resize(): void
  /** Pointer position in CSS pixels relative to the canvas, or null when it leaves. */
  setPointer(x: number | null, y?: number): void
  /** Scroll offset in viewport heights. */
  setScroll(viewports: number): void
  /** Draw a single frame (used for reduced motion). */
  render(): void
  start(): void
  stop(): void
  destroy(): void
}

function compile(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn('[dither] shader compile failed:', gl.getShaderInfoLog(shader))
    gl.deleteShader(shader)
    return null
  }
  return shader
}

function link(gl: WebGLRenderingContext) {
  const vs = compile(gl, gl.VERTEX_SHADER, VERT)
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG)
  if (!vs || !fs) return null
  const program = gl.createProgram()
  if (!program) return null
  gl.attachShader(program, vs)
  gl.attachShader(program, fs)
  gl.linkProgram(program)
  gl.deleteShader(vs)
  gl.deleteShader(fs)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.warn('[dither] program link failed:', gl.getProgramInfoLog(program))
    gl.deleteProgram(program)
    return null
  }
  return program
}

/** Returns null when WebGL is unavailable, so callers can show a static fallback. */
export function createDitherField(canvas: HTMLCanvasElement, { palette, cellSize = 3 }: DitherFieldOptions): DitherField | null {
  const gl = canvas.getContext('webgl', {
    alpha: false,
    antialias: false,
    depth: false,
    stencil: false,
    premultipliedAlpha: false,
    powerPreference: 'low-power',
  })
  if (!gl) return null
  const program = link(gl)
  if (!program) return null

  // One triangle that covers the whole clip space; cheaper than a two-triangle quad.
  const buffer = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  gl.useProgram(program)
  const aPos = gl.getAttribLocation(program, 'aPos')
  gl.enableVertexAttribArray(aPos)
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

  const u = (name: string) => gl.getUniformLocation(program, name)
  const uRes = u('uRes')
  const uTime = u('uTime')
  const uPointer = u('uPointer')
  const uPointerAmt = u('uPointerAmt')
  const uScroll = u('uScroll')
  palette.forEach((hex, i) => gl.uniform3fv(u(`uC${i}`), [...hexToRgb(hex)]))

  const pointer = { x: 0, y: 0, tx: 0, ty: 0, amt: 0, target: 0 }
  let scroll = 0
  let raf = 0
  let last = 0
  const t0 = performance.now()

  const draw = (now: number) => {
    // Ease the pointer so the light trails the cursor instead of snapping to it.
    const k = last ? Math.min(1, (now - last) / 120) : 1
    last = now
    pointer.x += (pointer.tx - pointer.x) * k
    pointer.y += (pointer.ty - pointer.y) * k
    pointer.amt += (pointer.target - pointer.amt) * k * 0.5

    gl.uniform2f(uRes, canvas.width, canvas.height)
    gl.uniform1f(uTime, (now - t0) / 1000)
    gl.uniform2f(uPointer, pointer.x, pointer.y)
    gl.uniform1f(uPointerAmt, pointer.amt)
    gl.uniform1f(uScroll, scroll)
    gl.drawArrays(gl.TRIANGLES, 0, 3)
  }

  // The field drifts slowly, so 30 fps looks the same as 60 and halves the GPU work.
  // Without a real GPU (software WebGL) frames get slow: coarsen the cells, then stop animating.
  let cell = cellSize
  let drawn = 0
  let slow = 0
  let stalled = false

  const fit = (force = false) => {
    const w = Math.max(1, Math.ceil(canvas.clientWidth / cell))
    const h = Math.max(1, Math.ceil(canvas.clientHeight / cell))
    if (!force && w === canvas.width && h === canvas.height) return
    canvas.width = w
    canvas.height = h
    gl.viewport(0, 0, w, h)
  }

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop)
    const dt = now - drawn
    if (dt < FRAME_MS) return
    slow = dt > SLOW_MS && drawn ? slow + 1 : Math.max(0, slow - 1)
    drawn = now
    draw(now)
    if (slow < SLOW_FRAMES) return
    slow = 0
    if (cell < MAX_CELL) {
      cell = Math.min(MAX_CELL, cell * 1.5)
      fit(true)
      draw(now) // resizing clears the canvas; repaint before the browser presents it
    } else {
      cancelAnimationFrame(raf)
      raf = 0
      stalled = true
    }
  }

  return {
    resize() {
      fit()
      if (stalled) draw(performance.now())
    },
    setPointer(x, y = 0) {
      if (x === null) {
        pointer.target = 0
        return
      }
      pointer.tx = x / cell
      pointer.ty = (canvas.clientHeight - y) / cell
      if (pointer.target === 0) {
        // Re-entering: start the light where the cursor is, not where it left.
        pointer.x = pointer.tx
        pointer.y = pointer.ty
      }
      pointer.target = 1
    },
    setScroll(viewports) {
      scroll = viewports
    },
    render() {
      last = 0
      draw(performance.now())
    },
    start() {
      if (raf || stalled) return
      last = 0
      raf = requestAnimationFrame(loop)
    },
    stop() {
      cancelAnimationFrame(raf)
      raf = 0
    },
    destroy() {
      cancelAnimationFrame(raf)
      raf = 0
      gl.deleteBuffer(buffer)
      gl.deleteProgram(program)
    },
  }
}
