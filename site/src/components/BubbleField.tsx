import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'

// Soap bubbles rendered analytically (screen-space spheres, no raymarching):
// thin-film iridescence + fresnel rim + window highlights over a warm cream backdrop.
// Physics, hit-testing and pop state live in JS; the shader only draws.
const MAX = 18

const FRAG = `#version 300 es
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform int uCount;
uniform vec4 uB[${MAX}];   // x, y (px, origin bottom-left), radius px, depth 0..1
uniform vec4 uS[${MAX}];   // pop 0..1, seed, born 0..1, unused
out vec4 outColor;

const vec3 BG = vec3(0.980, 0.965, 0.949);
const vec3 ROSE = vec3(0.788, 0.663, 0.627);
const vec3 TAUPE = vec3(0.486, 0.431, 0.400);
const vec3 BLUSH = vec3(0.937, 0.890, 0.863);

float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p){
  vec2 i = floor(p), f = fract(p); vec2 u = f*f*(3.0-2.0*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), u.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), u.x), u.y);
}

// Thin-film interference, pulled toward the palette so it stays pastel.
vec3 film(float thick){
  vec3 c = 0.5 + 0.5*cos(6.2831*(thick*vec3(1.0, 0.82, 0.66) + vec3(0.0, 0.33, 0.67)));
  return mix(c, mix(ROSE, vec3(1.0), 0.35), 0.45);
}

void main(){
  vec2 frag = gl_FragCoord.xy;
  vec2 uv = frag / uRes;
  vec3 col = BG;
  col = mix(col, BLUSH, smoothstep(0.9, 0.0, length((uv - vec2(0.5, 0.42)) * vec2(1.4, 1.0))) * 0.8);
  col = mix(col, mix(BG, ROSE, 0.25), smoothstep(0.6, 0.0, length(uv - vec2(0.85, 0.85))) * 0.25);

  for (int i = 0; i < ${MAX}; i++){
    if (i >= uCount) break;
    vec4 b = uB[i]; vec4 s = uS[i];
    float pop = s.x, seed = s.y, born = s.z;
    float r = b.z * born * (1.0 + pop*0.12);
    if (r < 1.0) continue;
    vec2 q = (frag - b.xy) / r;
    float d = length(q);
    // Depth of field: far bubbles get a softer edge.
    float soft = mix(0.035, 0.0045, b.w) * (1.0 + 300.0 / r * 0.02);
    float inside = 1.0 - smoothstep(1.0 - soft, 1.0 + soft, d);
    if (inside <= 0.0) continue;

    float z = sqrt(max(1.0 - d*d, 0.0));
    vec3 n = vec3(q, z);
    float fres = pow(1.0 - z, 2.2);

    // Swirling film thickness: gravity drains it toward the bottom, noise makes the marbling.
    float t = uTime*0.15 + seed*10.0;
    vec2 sw = q*1.6 + vec2(sin(t + q.y*2.0), cos(t*0.8 + q.x*2.0))*0.5;
    float thick = 0.55 + 0.25*q.y + 0.6*noise(sw*2.0 + seed*7.0) + 0.25*noise(sw*5.0 - t);
    vec3 irid = film(thick);

    // Reflections: soft window highlight upper-left, small kicker lower-right, faint horizon band.
    float hl = smoothstep(0.32, 0.0, length((q - vec2(-0.38, 0.42)) * vec2(1.0, 1.5)));
    float hl2 = smoothstep(0.14, 0.0, length(q - vec2(0.42, -0.4)));
    float horizon = exp(-pow((n.y + 0.15) * 7.0, 2.0)) * fres;

    float alpha = 0.04 + fres*0.75 + hl*0.75 + hl2*0.5;
    vec3 bc = irid * (0.85 + 0.3*fres);
    bc = mix(bc, TAUPE, horizon*0.25);
    bc = mix(bc, vec3(1.0), clamp(hl*1.1 + hl2*0.8, 0.0, 1.0));
    // Far bubbles fade into the haze.
    alpha *= mix(0.45, 1.0, b.w);

    // Pop: the film dissolves through noisy holes from the click side outward.
    if (pop > 0.0){
      float tear = noise(q*4.0 + seed*13.0) * 0.6 + (1.0 - d) * 0.4;
      alpha *= smoothstep(pop*1.2 - 0.1, pop*1.2 + 0.05, tear) * (1.0 - pop);
    }

    alpha *= inside;
    col = mix(col, bc, clamp(alpha, 0.0, 1.0));
  }

  col += (hash(frag + fract(uTime)) - 0.5) * 0.012;
  outColor = vec4(col, 1.0);
}`

const VERT = `#version 300 es
in vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0.0, 1.0); }`

type Bubble = {
  x: number; y: number; baseX: number; r: number; depth: number; vy: number
  amp: number; freq: number; phase: number; seed: number
  pop: number; popAt: number; born: number; bornAt: number; respawnAt: number
  pushX: number; pushY: number
  sx: number; sy: number // last drawn screen position (for hit-testing)
}
type Splash = { id: number; x: number; y: number; r: number }

const rand = (a: number, b: number) => a + Math.random() * (b - a)

function makeBubble(w: number, h: number, now: number, initial: boolean): Bubble {
  const depth = Math.pow(Math.random(), 0.8)
  const r = (w < 600 ? rand(26, 80) : rand(34, 140)) * (0.45 + depth * 0.75)
  const x = rand(r, w - r)
  return {
    x, baseX: x, y: initial ? rand(r, h - r) : rand(h * 0.15, h * 0.85), r, depth,
    vy: rand(8, 22) * (0.4 + depth),
    amp: rand(10, 40), freq: rand(0.15, 0.4), phase: rand(0, Math.PI * 2), seed: Math.random(),
    pop: 0, popAt: 0, born: initial ? 0 : 0, bornAt: initial ? now + rand(0, 900) : now, respawnAt: 0,
    pushX: 0, pushY: 0, sx: x, sy: 0,
  }
}

export function BubbleField({ paused, onPop, count: countProp }: { paused: boolean; onPop?: () => void; count?: { desktop: number; mobile: number } }) {
  const ref = useRef<HTMLCanvasElement>(null)
  const [splashes, setSplashes] = useState<Splash[]>([])
  const desktopCount = countProp?.desktop ?? 10
  const mobileCount = countProp?.mobile ?? 6

  useEffect(() => {
    const canvas = ref.current!
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false })
    if (!gl) return

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!
      gl.shaderSource(s, src)
      gl.compileShader(s)
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s))
      return s
    }
    const prog = gl.createProgram()!
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    gl.useProgram(prog)
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'aPos')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(prog, 'uRes')
    const uTime = gl.getUniformLocation(prog, 'uTime')
    const uCount = gl.getUniformLocation(prog, 'uCount')
    const uB = gl.getUniformLocation(prog, 'uB')
    const uS = gl.getUniformLocation(prog, 'uS')

    const dpr = Math.min(window.devicePixelRatio, 1.5)
    let W = 0, H = 0
    const resize = () => {
      W = canvas.clientWidth
      H = canvas.clientHeight
      canvas.width = Math.floor(W * dpr)
      canvas.height = Math.floor(H * dpr)
      gl.viewport(0, 0, canvas.width, canvas.height)
    }
    resize()
    window.addEventListener('resize', resize)

    const start = performance.now()
    const count = W < 600 ? mobileCount : desktopCount
    const bubbles: Bubble[] = Array.from({ length: count }, () => makeBubble(W, H, start, true))
      .sort((a, b) => a.depth - b.depth) // draw far first
    const mouse = { x: -9999, y: -9999 }

    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect()
      mouse.x = e.clientX - r.left
      mouse.y = e.clientY - r.top
    }
    // Hit-test front-most bubble first; ignore clicks on real controls.
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('a, button')) return
      const rect = canvas.getBoundingClientRect()
      const px = e.clientX - rect.left
      const py = e.clientY - rect.top
      if (py < 0 || py > rect.height) return
      for (let i = bubbles.length - 1; i >= 0; i--) {
        const b = bubbles[i]
        if (b.popAt || b.born < 0.6) continue
        if (Math.hypot(px - b.sx, py - b.sy) < b.r) {
          const now = performance.now()
          b.popAt = now
          b.respawnAt = now + rand(900, 2200)
          setSplashes((s) => [...s.slice(-6), { id: now, x: b.sx, y: b.sy, r: b.r }])
          onPop?.()
          break
        }
      }
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerdown', onDown)

    let visible = true
    const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting))
    io.observe(canvas)

    const B = new Float32Array(MAX * 4)
    const S = new Float32Array(MAX * 4)
    let last = start
    let raf = 0
    const frame = (now: number) => {
      raf = requestAnimationFrame(frame)
      if (!visible) { last = now; return }
      const dt = Math.min((now - last) / 1000, 0.05)
      last = now
      const t = (now - start) / 1000
      const scrollY = window.scrollY
      let resort = false

      bubbles.forEach((b, i) => {
        // lifecycle
        if (b.popAt) {
          b.pop = Math.min((now - b.popAt) / 320, 1)
          if (now > b.respawnAt) { Object.assign(b, makeBubble(W, H, now, false)); resort = true }
        }
        b.born = Math.min(Math.max((now - b.bornAt) / 900, 0), 1)
        const bornEase = 1 - Math.pow(1 - b.born, 3) * Math.cos(b.born * 6) // slight overshoot swell

        if (!paused) {
          b.y -= b.vy * dt
          if (b.y + b.r < -20) { b.y = H + b.r + 10; b.baseX = rand(b.r, W - b.r) }
          b.x = b.baseX + Math.sin(t * b.freq * 2 + b.phase) * b.amp
          // gentle push away from cursor
          const dx = b.x + b.pushX - mouse.x
          const dy = b.y + b.pushY - mouse.y
          const dist = Math.hypot(dx, dy)
          const reach = b.r + 120
          if (dist < reach && dist > 0.1) {
            const f = (1 - dist / reach) * 60 * b.depth
            b.pushX += (dx / dist) * f * dt * 6
            b.pushY += (dy / dist) * f * dt * 6
          }
          b.pushX *= 0.96
          b.pushY *= 0.96
        }

        const sx = b.x + b.pushX
        const sy = b.y + b.pushY - scrollY * (0.15 + b.depth * 0.5) // depth parallax on scroll
        b.sx = sx
        b.sy = sy
        B.set([sx * dpr, (H - sy) * dpr, b.r * dpr, b.depth], i * 4)
        S.set([b.pop, b.seed, paused ? 1 : Math.max(bornEase, 0), 0], i * 4)
      })

      if (resort) bubbles.sort((a, b) => a.depth - b.depth)
      gl.uniform2f(uRes, canvas.width, canvas.height)
      gl.uniform1f(uTime, paused ? 3 : t)
      gl.uniform1i(uCount, bubbles.length)
      gl.uniform4fv(uB, B)
      gl.uniform4fv(uS, S)
      gl.drawArrays(gl.TRIANGLES, 0, 3)
    }
    raf = requestAnimationFrame(frame)

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [paused, onPop, desktopCount, mobileCount])

  return (
    <>
      <canvas ref={ref} className="bubble-canvas" aria-hidden="true" />
      <div className="splashes" aria-hidden="true">
        {splashes.map((s) => (
          <Splash key={s.id} {...s} onDone={() => setSplashes((all) => all.filter((x) => x.id !== s.id))} />
        ))}
      </div>
    </>
  )
}

// Droplets that spray out of a popped bubble.
function Splash({ x, y, r, onDone }: Splash & { onDone: () => void }) {
  const [drops] = useState(() =>
    Array.from({ length: 14 }, (_, i) => {
      const a = (i / 14) * Math.PI * 2 + Math.random() * 0.4
      return { a, dist: r * rand(0.9, 1.5), size: rand(4, 10) }
    }),
  )
  return (
    <span className="splash" style={{ left: x, top: y }}>
      {drops.map((d, i) => (
        <motion.i
          key={i}
          style={{ width: d.size, height: d.size }}
          initial={{ x: Math.cos(d.a) * r * 0.85, y: Math.sin(d.a) * r * 0.85, opacity: 0.9, scale: 1 }}
          animate={{ x: Math.cos(d.a) * d.dist, y: Math.sin(d.a) * d.dist + 30, opacity: 0, scale: 0.3 }}
          transition={{ duration: 0.75, ease: [0.2, 0.8, 0.3, 1] }}
          onAnimationComplete={i === 0 ? onDone : undefined}
        />
      ))}
    </span>
  )
}
