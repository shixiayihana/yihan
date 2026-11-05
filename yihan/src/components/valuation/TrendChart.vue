<script setup lang="ts">
import { computed } from 'vue'
import { TriangleAlert } from '@lucide/vue'
import type { Valuation } from '@/api/cn-index-percentile'
import { formatPercent } from '@/utils/percent'

const props = defineProps<{
  points: Valuation[]
  loading: boolean
  error: string
}>()

defineEmits<{ retry: [] }>()

const VIEW_W = 640
const VIEW_H = 200
const PAD_X = 6
const PAD_TOP = 10
const PAD_BOTTOM = 10
const INNER_W = VIEW_W - PAD_X * 2
const INNER_H = VIEW_H - PAD_TOP - PAD_BOTTOM

// y(v) = PAD_TOP + (1 - v) * INNER_H，0~1 的百分位映射到画布高度
const Y = {
  y100: PAD_TOP,
  y80: PAD_TOP + 0.2 * INNER_H,
  y40: PAD_TOP + 0.6 * INNER_H,
  y0: PAD_TOP + INNER_H,
}

function clamp01(value: number) {
  return Math.min(1, Math.max(0, value))
}

/**
 * 用固定 viewBox + preserveAspectRatio="none" 绘制，
 * 折线加 non-scaling-stroke，保证任意容器宽度下线宽不变。
 */
const chart = computed(() => {
  const points = props.points
  const count = points.length

  if (count < 2) {
    return {
      empty: true,
      pePoints: '',
      pbPoints: '',
      areaPoints: '',
      lastPeX: 0,
      lastPeY: 0,
      lastPbX: 0,
      lastPbY: 0,
      firstDate: '',
      lastDate: '',
      ...Y,
    }
  }

  const x = (index: number) => PAD_X + (index / (count - 1)) * INNER_W
  const y = (value: number) => PAD_TOP + (1 - clamp01(value)) * INNER_H
  const line = (pick: (point: Valuation) => number) =>
    points.map((point, index) => `${x(index).toFixed(1)},${y(pick(point)).toFixed(1)}`).join(' ')

  const pePoints = line((point) => point.pePercentile)
  const pbPoints = line((point) => point.pbPercentile)
  const lastIndex = count - 1
  const last = points[lastIndex]!

  return {
    empty: false,
    pePoints,
    pbPoints,
    areaPoints: `${x(0).toFixed(1)},${Y.y0.toFixed(1)} ${pePoints} ${x(lastIndex).toFixed(1)},${Y.y0.toFixed(1)}`,
    lastPeX: x(lastIndex),
    lastPeY: y(last.pePercentile),
    lastPbX: x(lastIndex),
    lastPbY: y(last.pbPercentile),
    firstDate: points[0]!.date,
    lastDate: last.date,
    ...Y,
  }
})

const ariaLabel = computed(() => {
  const points = props.points
  const last = points[points.length - 1]
  if (!last) return '历史走势图'
  return `历史走势图：PE 百分位 ${formatPercent(last.pePercentile)}，PB 百分位 ${formatPercent(
    last.pbPercentile,
  )}，区间 ${points[0]?.date} 至 ${last.date}`
})
</script>

<template>
  <div>
    <!-- 首次加载：固定高度骨架，避免展开时页面跳动 -->
    <div
      v-if="loading && points.length === 0"
      class="h-44 w-full animate-pulse rounded-xl bg-[var(--glass-bg-hover)] motion-reduce:animate-none"
      role="status"
      aria-label="正在加载历史数据"
    ></div>

    <!-- 请求失败且没有旧数据 -->
    <div
      v-else-if="error && points.length === 0"
      class="flex h-44 flex-col items-center justify-center gap-3 text-sm"
    >
      <p class="flex items-center gap-2 text-[var(--color-text-muted)]">
        <TriangleAlert :size="16" />
        {{ error }}
      </p>
      <button
        type="button"
        class="rounded-full border border-[var(--glass-border)] px-4 py-1.5 text-xs text-[var(--color-text)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
        @click="$emit('retry')"
      >
        重新加载
      </button>
    </div>

    <!-- 历史点不足 -->
    <div
      v-else-if="chart.empty"
      class="flex h-44 items-center justify-center text-sm text-[var(--color-text-muted)]"
    >
      历史数据不足
    </div>

    <!-- 折线图 -->
    <div v-else>
      <div class="flex gap-2">
        <div
          class="flex w-8 flex-col justify-between py-2 text-right font-mono text-[10px] leading-none text-[var(--color-text-muted)]"
        >
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>

        <svg
          class="h-44 min-w-0 flex-1"
          :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`"
          preserveAspectRatio="none"
          role="img"
          :aria-label="ariaLabel"
        >
          <defs>
            <linearGradient id="valuation-pe-area" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="var(--accent)" stop-opacity="0.22" />
              <stop offset="100%" stop-color="var(--accent)" stop-opacity="0" />
            </linearGradient>
          </defs>

          <!-- 高 / 中 / 低位区间底色 -->
          <rect
            x="0"
            :y="chart.y100"
            :width="VIEW_W"
            :height="chart.y80 - chart.y100"
            fill="var(--danger-soft)"
          />
          <rect
            x="0"
            :y="chart.y80"
            :width="VIEW_W"
            :height="chart.y40 - chart.y80"
            fill="var(--warning-soft)"
          />
          <rect
            x="0"
            :y="chart.y40"
            :width="VIEW_W"
            :height="chart.y0 - chart.y40"
            fill="var(--success-soft)"
          />

          <!-- 40% / 80% 参考线 -->
          <line
            x1="0"
            :y1="chart.y80"
            :x2="VIEW_W"
            :y2="chart.y80"
            stroke="var(--glass-border)"
            stroke-dasharray="4 4"
            vector-effect="non-scaling-stroke"
          />
          <line
            x1="0"
            :y1="chart.y40"
            :x2="VIEW_W"
            :y2="chart.y40"
            stroke="var(--glass-border)"
            stroke-dasharray="4 4"
            vector-effect="non-scaling-stroke"
          />

          <!-- PE 面积 + 两条折线 -->
          <polygon :points="chart.areaPoints" fill="url(#valuation-pe-area)" />
          <polyline
            :points="chart.pePoints"
            fill="none"
            stroke="var(--accent)"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
            vector-effect="non-scaling-stroke"
          />
          <polyline
            :points="chart.pbPoints"
            fill="none"
            stroke="var(--accent-2)"
            stroke-width="2"
            stroke-linejoin="round"
            stroke-linecap="round"
            vector-effect="non-scaling-stroke"
          />

          <!-- 末端点 -->
          <circle :cx="chart.lastPeX" :cy="chart.lastPeY" r="3" fill="var(--accent)" />
          <circle :cx="chart.lastPbX" :cy="chart.lastPbY" r="3" fill="var(--accent-2)" />
        </svg>
      </div>

      <div
        class="mt-2 flex justify-between pl-10 font-mono text-[10px] text-[var(--color-text-muted)]"
      >
        <span>{{ chart.firstDate }}</span>
        <span>{{ chart.lastDate }}</span>
      </div>

      <p v-if="error" class="mt-2 text-xs text-[var(--danger)]">走势更新失败：{{ error }}</p>
    </div>
  </div>
</template>
