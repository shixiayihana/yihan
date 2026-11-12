<script setup lang="ts">
import { computed, onBeforeUnmount, watch } from 'vue'
import { ChevronDown } from '@lucide/vue'
import PercentileBar from './PercentileBar.vue'
import TrendChart from './TrendChart.vue'
import { HISTORY_RANGES, useValuationHistory } from '@/composables/useValuationHistory'
import { formatPercent } from '@/utils/percent'
import type { Valuation } from '@/api/cn-index-percentile'

const props = defineProps<{
  valuation: Valuation
  expanded: boolean
}>()

const emit = defineEmits<{ toggle: [] }>()

const {
  data: historyPoints,
  range,
  isLoading,
  error: historyError,
  load: loadHistory,
  dispose: disposeHistory,
} = useValuationHistory(props.valuation.indexCode)

const panelId = computed(() => `trend-${props.valuation.indexCode}`)

// 展开时才请求历史，收起时取消在途请求
watch(
  () => props.expanded,
  (open) => {
    if (open) loadHistory()
    else disposeHistory()
  },
  { immediate: true },
)

onBeforeUnmount(disposeHistory)
</script>

<template>
  <article
    class="glass-panel rounded-2xl p-5 transition-shadow duration-300"
    :class="{ 'sm:col-span-2 xl:col-span-3': expanded }"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="min-w-0">
        <h2 class="truncate text-xl font-semibold text-[var(--color-text)]">
          {{ valuation.indexName }}
        </h2>
        <p class="mt-1 font-mono text-xs text-[var(--color-text-muted)]">
          {{ valuation.indexCode }}
        </p>
      </div>
      <span class="shrink-0 font-mono text-xs text-[var(--color-text-muted)]">
        {{ valuation.date }}
      </span>
    </div>

    <div class="mt-5 grid gap-5" :class="{ 'sm:grid-cols-2': expanded }">
      <PercentileBar label="PE 百分位" :value="valuation.pePercentile" />
      <PercentileBar label="PB 百分位" :value="valuation.pbPercentile" />
    </div>

    <button
      type="button"
      class="mt-5 flex w-full items-center justify-between rounded-xl border border-[var(--glass-border)] px-3 py-2 text-xs text-[var(--color-text-muted)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      :aria-expanded="expanded"
      :aria-controls="panelId"
      @click="emit('toggle')"
    >
      <span>{{ expanded ? '收起走势' : '查看走势' }}</span>
      <ChevronDown
        :size="14"
        class="transition-transform duration-300"
        :class="{ 'rotate-180': expanded }"
      />
    </button>

    <Transition name="fade">
      <div
        v-if="expanded"
        :id="panelId"
        class="mt-5 border-t border-[var(--glass-border)] pt-5"
      >
        <div class="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div class="flex items-center gap-4 text-xs text-[var(--color-text)]">
            <span class="flex items-center gap-1.5">
              <i class="h-2 w-2 rounded-full bg-[var(--accent)]"></i>
              PE {{ formatPercent(valuation.pePercentile) }}
            </span>
            <span class="flex items-center gap-1.5">
              <i class="h-2 w-2 rounded-full bg-[var(--accent-2)]"></i>
              PB {{ formatPercent(valuation.pbPercentile) }}
            </span>
          </div>

          <div
            class="flex gap-1 rounded-full bg-[var(--glass-bg-hover)] p-1"
            role="group"
            aria-label="时间区间"
          >
            <button
              v-for="option in HISTORY_RANGES"
              :key="option.key"
              type="button"
              class="rounded-full px-3 py-1 text-xs transition-colors"
              :class="
                range === option.key
                  ? 'bg-[var(--accent)] text-white'
                  : 'text-[var(--color-text-muted)] hover:text-[var(--color-text)]'
              "
              :aria-pressed="range === option.key"
              @click="loadHistory(option.key)"
            >
              {{ option.label }}
            </button>
          </div>
        </div>

        <TrendChart
          :points="historyPoints"
          :loading="isLoading"
          :error="historyError"
          @retry="loadHistory(range, true)"
        />
      </div>
    </Transition>
  </article>
</template>
