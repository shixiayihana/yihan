<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useThemeStore } from '@/stores/theme'

const theme = useThemeStore()

const canvasRef = ref<HTMLCanvasElement | null>(null)

interface Snowflake {
  x: number
  y: number
  vy: number // 下落速度 px/s
  size: number // 绘制尺寸 px
  alpha: number // 透明度
  swayAmp: number // 水平摆动幅度 px/s
  swayFreq: number // 摆动频率
  swayPhase: number // 摆动相位
  spin: number // 旋转速度 rad/s
  rotation: number // 当前旋转角
  near: boolean // true=近处六角大雪花 false=远处圆点小雪花
}

let flakes: Snowflake[] = []
let rafId = 0
let last = 0
let elapsed = 0
let width = 0
let height = 0
let ctx: CanvasRenderingContext2D | null = null

let nearSprite: HTMLCanvasElement | null = null
let farSprite: HTMLCanvasElement | null = null

const SPRITE_SIZE = 72

// 雪花颜色：暗色纯白，亮色用灰蓝（在浅背景上可见）
function snowColor() {
  return theme.resolvedDark ? '255, 255, 255' : '185, 198, 212'
}

// 往路径里加一条「由粗到细」的梯形臂（几何多边形，而非描边线条）
function addArm(
  p: Path2D,
  ox: number,
  oy: number,
  angle: number,
  r0: number,
  r1: number,
  w0: number,
  w1: number,
) {
  const dx = Math.cos(angle)
  const dy = Math.sin(angle)
  const px = -dy
  const py = dx
  const x0 = ox + dx * r0
  const y0 = oy + dy * r0
  const x1 = ox + dx * r1
  const y1 = oy + dy * r1
  p.moveTo(x0 + px * w0, y0 + py * w0)
  p.lineTo(x1 + px * w1, y1 + py * w1)
  p.lineTo(x1 - px * w1, y1 - py * w1)
  p.lineTo(x0 - px * w0, y0 - py * w0)
  p.closePath()
}

// 往路径里加一个正六边形
function addHexagon(p: Path2D, cx: number, cy: number, r: number) {
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2
    const x = cx + Math.cos(a) * r
    const y = cy + Math.sin(a) * r
    if (i === 0) p.moveTo(x, y)
    else p.lineTo(x, y)
  }
  p.closePath()
}

// 六角结晶轮廓：中心六角核 + 6 条梯形主臂 + 每臂两对细侧枝
function crystalPath(cx: number, cy: number, R: number) {
  const p = new Path2D()
  addHexagon(p, cx, cy, R * 0.2)
  for (let i = 0; i < 6; i++) {
    const a = (Math.PI / 3) * i - Math.PI / 2
    // 主臂：从核边缘伸到外缘，末端收成小钝尖
    addArm(p, cx, cy, a, R * 0.1, R * 0.98, R * 0.085, R * 0.015)
    // 侧枝：两对，越靠外越短，形成羽状分叉
    const branches = [
      { at: R * 0.5, len: R * 0.3, w: R * 0.048 },
      { at: R * 0.76, len: R * 0.18, w: R * 0.032 },
    ]
    for (const b of branches) {
      const bx = cx + Math.cos(a) * b.at
      const by = cy + Math.sin(a) * b.at
      addArm(p, bx, by, a + Math.PI / 3, 0, b.len, b.w, b.w * 0.2)
      addArm(p, bx, by, a - Math.PI / 3, 0, b.len, b.w, b.w * 0.2)
    }
  }
  return p
}

// 预渲染六角雪花 sprite（近处大雪花）：几何结晶 + 渐变通透感 + 柔边
function buildNearSprite() {
  const c = document.createElement('canvas')
  c.width = SPRITE_SIZE
  c.height = SPRITE_SIZE
  const g = c.getContext('2d')!
  const cx = SPRITE_SIZE / 2
  const cy = SPRITE_SIZE / 2
  // 留出 8px 边距，避免模糊光晕被画布边缘裁掉
  const R = SPRITE_SIZE / 2 - 8
  const col = snowColor()
  const path = crystalPath(cx, cy, R)

  // 1) 外发光：略放大 + 大模糊 + 低透明度，冰晶周围一圈柔光
  g.save()
  g.filter = 'blur(3px)'
  g.globalAlpha = 0.5
  g.translate(cx, cy)
  g.scale(1.08, 1.08)
  g.translate(-cx, -cy)
  g.fillStyle = `rgba(${col}, 0.65)`
  g.fill(path)
  g.restore()

  // 2) 主体：径向渐变填充 —— 中心实、外缘半透，呈现冰晶的「通透感」
  const grad = g.createRadialGradient(cx, cy, 0, cx, cy, R)
  grad.addColorStop(0, `rgba(${col}, 1)`)
  grad.addColorStop(0.4, `rgba(${col}, 0.92)`)
  grad.addColorStop(0.75, `rgba(${col}, 0.6)`)
  grad.addColorStop(1, `rgba(${col}, 0.22)`)
  g.save()
  g.filter = 'blur(0.8px)' // 极轻微模糊，柔化多边形硬边
  g.fillStyle = grad
  g.fill(path)
  g.restore()

  // 3) 核心高光：一小团更亮的光，模拟光在冰晶中心折射
  const core = g.createRadialGradient(cx, cy, 0, cx, cy, R * 0.26)
  core.addColorStop(0, 'rgba(255, 255, 255, 0.55)')
  core.addColorStop(0.6, `rgba(${col}, 0.35)`)
  core.addColorStop(1, `rgba(${col}, 0)`)
  g.fillStyle = core
  g.beginPath()
  g.arc(cx, cy, R * 0.26, 0, Math.PI * 2)
  g.fill()

  return c
}

// 预渲染柔光圆点 sprite（远处小雪花）
function buildFarSprite() {
  const c = document.createElement('canvas')
  c.width = SPRITE_SIZE
  c.height = SPRITE_SIZE
  const g = c.getContext('2d')!
  const col = snowColor()
  const grad = g.createRadialGradient(
    SPRITE_SIZE / 2,
    SPRITE_SIZE / 2,
    0,
    SPRITE_SIZE / 2,
    SPRITE_SIZE / 2,
    SPRITE_SIZE / 2,
  )
  grad.addColorStop(0, `rgba(${col}, 1)`)
  grad.addColorStop(0.4, `rgba(${col}, 0.6)`)
  grad.addColorStop(1, `rgba(${col}, 0)`)
  g.fillStyle = grad
  g.fillRect(0, 0, SPRITE_SIZE, SPRITE_SIZE)
  return c
}

function rebuildSprites() {
  nearSprite = buildNearSprite()
  farSprite = buildFarSprite()
}

function makeFlake(initial: boolean): Snowflake {
  const near = Math.random() < 0.28
  const size = near ? 16 + Math.random() * 18 : 3 + Math.random() * 6
  const vy = near ? 30 + Math.random() * 30 : 12 + Math.random() * 20
  return {
    x: Math.random() * width,
    y: initial ? Math.random() * height : -size - 10,
    vy,
    size,
    alpha: near ? 0.75 + Math.random() * 0.25 : 0.3 + Math.random() * 0.3,
    swayAmp: near ? 20 + Math.random() * 30 : 10 + Math.random() * 20,
    swayFreq: 0.3 + Math.random() * 0.7,
    swayPhase: Math.random() * Math.PI * 2,
    spin: near ? (Math.random() - 0.5) * 1.2 : 0,
    rotation: Math.random() * Math.PI * 2,
    near,
  }
}

function initFlakes() {
  const count = Math.min(80, Math.max(24, Math.round((width * height) / 40000)))
  flakes = Array.from({ length: count }, () => makeFlake(true))
}

function resize() {
  const canvas = canvasRef.value
  if (!canvas) return
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  width = window.innerWidth
  height = window.innerHeight
  canvas.width = width * dpr
  canvas.height = height * dpr
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`
  ctx = canvas.getContext('2d')
  ctx?.scale(dpr, dpr)
  initFlakes()
}

function frame(now: number) {
  if (!ctx) return
  const dt = Math.min((now - last) / 1000, 0.05)
  last = now
  elapsed += dt

  ctx.clearRect(0, 0, width, height)
  for (const f of flakes) {
    f.y += f.vy * dt
    f.x += Math.sin(elapsed * f.swayFreq + f.swayPhase) * f.swayAmp * dt
    f.rotation += f.spin * dt

    // 越界重置（飘出底部 → 从顶部重新生成）
    if (f.y > height + f.size) {
      Object.assign(f, makeFlake(false))
    }
    // 水平越界回绕
    if (f.x > width + f.size) f.x = -f.size
    else if (f.x < -f.size) f.x = width + f.size

    const sprite = f.near ? nearSprite : farSprite
    if (!sprite) continue
    ctx.globalAlpha = f.alpha
    if (f.near) {
      ctx.save()
      ctx.translate(f.x, f.y)
      ctx.rotate(f.rotation)
      ctx.drawImage(sprite, -f.size / 2, -f.size / 2, f.size, f.size)
      ctx.restore()
    } else {
      ctx.drawImage(sprite, f.x - f.size / 2, f.y - f.size / 2, f.size, f.size)
    }
  }
  ctx.globalAlpha = 1

  rafId = requestAnimationFrame(frame)
}

function start() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  last = performance.now()
  rafId = requestAnimationFrame(frame)
}

onMounted(() => {
  rebuildSprites()
  resize()
  start()
  window.addEventListener('resize', resize)
})

onBeforeUnmount(() => {
  cancelAnimationFrame(rafId)
  window.removeEventListener('resize', resize)
})

watch(
  () => theme.resolvedDark,
  () => rebuildSprites(),
)
</script>

<template>
  <canvas
    ref="canvasRef"
    class="pointer-events-none fixed inset-0 z-40"
    aria-hidden="true"
  ></canvas>
</template>
