/**
 * Full-screen ordered-dither shader.
 *
 * 1. A domain-warped fbm noise field drifts slowly over time.
 * 2. The page scroll position shifts it (parallax) and fades the hero emphasis out.
 * 3. The pointer adds a soft light.
 * 4. The result is quantised to four palette colours with an 8×8 Bayer matrix,
 *    computed arithmetically so it works on WebGL 1 without textures.
 */
export const VERT = /* glsl */ `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`

export const FRAG = /* glsl */ `
#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform vec2 uRes;        // canvas size in dither cells
uniform float uTime;      // seconds
uniform vec2 uPointer;    // dither cells, origin bottom-left
uniform float uPointerAmt;// 0..1, eased in JS
uniform float uScroll;    // scroll offset in viewport heights
uniform vec3 uC0;
uniform vec3 uC1;
uniform vec3 uC2;
uniform vec3 uC3;

float bayer2(vec2 a) { a = floor(a); return fract(a.x * 0.5 + a.y * a.y * 0.75); }
float bayer4(vec2 a) { return bayer2(0.5 * a) * 0.25 + bayer2(a); }
float bayer8(vec2 a) { return bayer4(0.5 * a) * 0.25 + bayer2(a); }

float hash(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

const mat2 ROT = mat2(0.8, -0.6, 0.6, 0.8);

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = ROT * p * 2.03;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 px = gl_FragCoord.xy;
  vec2 uv = px / uRes.y;
  float t = uTime * 0.05;

  vec2 p = uv * 1.6 - vec2(0.0, uScroll * 0.5);
  vec2 q = vec2(fbm(p + vec2(0.0, t)), fbm(p + vec2(5.2, 1.3) - t));
  vec2 r = vec2(fbm(p + 2.0 * q + vec2(1.7, 9.2) + 0.6 * t), fbm(p + 2.0 * q + vec2(8.3, 2.8) - 0.4 * t));
  float f = smoothstep(0.3, 0.9, fbm(p + 2.2 * r));

  // Bright on the right while the hero is on screen (the text sits on the left), calm afterwards.
  float hero = 1.0 - smoothstep(0.2, 1.1, uScroll);
  float side = smoothstep(0.1, 0.95, px.x / uRes.x);
  f *= mix(0.55, mix(0.45, 1.15, side), hero);

  float d = distance(uv, uPointer / uRes.y);
  f += uPointerAmt * mix(0.35, 0.7, hero) * exp(-d * d * 14.0);

  vec2 c = px / uRes - 0.5;
  f *= 1.0 - 0.6 * dot(c, c);

  float idx = floor(clamp(f, 0.0, 1.0) * 3.0 + bayer8(px));
  vec3 col = idx < 0.5 ? uC0 : idx < 1.5 ? uC1 : idx < 2.5 ? uC2 : uC3;
  gl_FragColor = vec4(col / 255.0, 1.0);
}
`
