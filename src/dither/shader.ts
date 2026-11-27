/**
 * Full-screen ordered-dither shader.
 *
 * 1. A large sphere, shaded with a soft key light and a specular highlight. The light drifts
 *    on its own and swings towards the pointer, so the shading follows the mouse.
 * 2. The sphere slowly turns: a low-frequency noise texture is read from the rotated normal,
 *    so there is no seam.
 * 3. Around it, a thin halo and a very faint wave field keep the rest of the page textured.
 * 4. Scrolling lifts the sphere out of view faster than the page (parallax).
 * 5. The brightness is quantised to four palette colours with an 8×8 Bayer matrix, computed
 *    arithmetically so it works on WebGL 1 without textures. Only the specular peak reaches
 *    the accent colour.
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

uniform vec2 uRes;         // canvas size in dither cells
uniform float uTime;       // seconds
uniform vec2 uPointer;     // dither cells, origin bottom-left
uniform float uPointerAmt; // 0..1, eased in JS
uniform float uScroll;     // scroll offset in viewport heights
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

void main() {
  vec2 px = gl_FragCoord.xy;
  float aspect = uRes.x / uRes.y;
  vec2 uv = px / uRes.y;            // 0..aspect across, 0..1 up
  vec2 pointer = uPointer / uRes.y;
  float t = uTime;
  float wide = step(1.0, aspect);

  // Placement: right of the wordmark on wide screens, tucked into the top corner on phones.
  float R = mix(0.2, 0.4, wide);
  vec2 c = vec2(aspect * mix(0.86, 0.75, wide), mix(0.84, 0.6, wide));
  c.y += uScroll * 1.15;

  vec2 d = (uv - c) / R;
  float r2 = dot(d, d);
  float f;

  if (r2 < 1.0) {
    vec3 n = vec3(d, sqrt(1.0 - r2));

    // Key light from the upper right, drifting slowly; the pointer pulls it towards itself.
    float a = 0.35 * sin(t * 0.13);
    vec3 key = normalize(vec3(0.55 * cos(a) + 0.2 * sin(a), 0.5, 0.65));
    vec3 toPointer = normalize(vec3((pointer - c) / R * 0.9, 0.8));
    vec3 L = normalize(mix(key, toPointer, 0.8 * uPointerAmt));

    // Slow rotation about the vertical axis; texture from the rotated normal has no seam.
    float s = sin(t * 0.06);
    float k = cos(t * 0.06);
    vec3 m = vec3(k * n.x + s * n.z, n.y, -s * n.x + k * n.z);
    float tex = 0.78 + 0.34 * noise(m.xy * 2.4 + m.z * 1.7) + 0.12 * noise(m.yz * 6.0 + 3.1);

    float diffuse = clamp((dot(n, L) + 0.2) / 1.2, 0.0, 1.0);
    vec3 h = normalize(L + vec3(0.0, 0.0, 1.0));
    float spec = pow(max(dot(n, h), 0.0), 48.0);
    float rim = pow(1.0 - n.z, 4.0) * 0.12;

    // Diffuse tops out around level 2 (light grey); only the specular peak reaches the accent.
    f = 0.02 + 0.64 * pow(diffuse, 1.25) * tex + 0.6 * spec + rim;
  } else {
    float r = sqrt(r2);
    float halo = 0.2 * exp(-(r - 1.0) * 9.0);
    float waves = 0.1 + 0.07 * sin(uv.x * 2.6 + uv.y * 1.4 + t * 0.12) * sin(uv.y * 3.1 - t * 0.09);
    float glow = uPointerAmt * 0.2 * exp(-dot(uv - pointer, uv - pointer) * 18.0);
    f = halo + waves + glow;
  }

  // Keep the left side calm where the hero copy sits, and the whole field quieter on phones.
  float hero = 1.0 - smoothstep(0.3, 1.0, uScroll);
  f *= mix(1.0, mix(0.45, 1.0, smoothstep(0.15, 0.75, px.x / uRes.x)), hero * wide);
  f *= mix(0.8, 1.0, wide);

  float idx = floor(clamp(f, 0.0, 1.0) * 3.0 + bayer8(px));
  vec3 col = idx < 0.5 ? uC0 : idx < 1.5 ? uC1 : idx < 2.5 ? uC2 : uC3;
  gl_FragColor = vec4(col / 255.0, 1.0);
}
`
