<script setup lang="ts">
import { computed } from 'vue'
import { formatPercent, percentLevel, percentLevelLabel } from '@/utils/percent'

const props = defineProps<{
  label: string
  /** 0 ~ 1 */
  value: number
}>()

const percent = computed(() => Math.min(100, Math.max(0, props.value * 100)))
const displayValue = computed(() => formatPercent(props.value))
const level = computed(() => percentLevel(props.value))
const levelText = computed(() => percentLevelLabel(level.value))

const textClass = computed(
  () =>
    ({
      low: 'text-[var(--success)]',
      middle: 'text-[var(--warning)]',
      high: 'text-[var(--danger)]',
    })[level.value],
)

const fillClass = computed(
  () =>
    ({
      low: 'bg-[var(--success)]',
      middle: 'bg-[var(--warning)]',
      high: 'bg-[var(--danger)]',
    })[level.value],
)
</script>

<template>
  <div>
    <div class="flex items-baseline justify-between gap-3">
      <span class="text-sm text-[var(--color-text)]">{{ label }}</span>
      <strong class="font-mono text-base font-semibold" :class="textClass">
        {{ displayValue }}
      </strong>
    </div>

    <div
      class="relative mt-2 h-2 overflow-hidden rounded-full bg-[var(--glass-bg-hover)]"
      role="progressbar"
      aria-valuemin="0"
      aria-valuemax="100"
      :aria-valuenow="Number(percent.toFixed(2))"
      :aria-label="`${label} ${displayValue}`"
    >
      <span
        class="block h-full rounded-full transition-[width] duration-500 ease-out motion-reduce:transition-none"
        :class="fillClass"
        :style="{ width: `${percent}%` }"
      ></span>
      <!-- 40% / 80% 阈值刻度，让色带边界可见 -->
      <span class="absolute inset-y-0 left-[40%] w-px bg-black/10 dark:bg-white/20"></span>
      <span class="absolute inset-y-0 left-[80%] w-px bg-black/10 dark:bg-white/20"></span>
    </div>

    <span class="mt-1.5 inline-block text-xs" :class="textClass">{{ levelText }}</span>
  </div>
</template>
