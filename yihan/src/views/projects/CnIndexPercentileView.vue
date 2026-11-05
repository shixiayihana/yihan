<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { ArrowLeft, RefreshCw } from '@lucide/vue'
import ValuationCard from '@/components/valuation/ValuationCard.vue'
import ValuationSkeleton from '@/components/valuation/ValuationSkeleton.vue'
import StatePanel from '@/components/valuation/StatePanel.vue'
import { useLatestValuations } from '@/composables/useLatestValuations'
import { invalidateHistoryCache } from '@/composables/useValuationHistory'

const { data, status, error, isRefreshing, load, refresh } = useLatestValuations()

/** 手风琴：同时只展开一个指数 */
const expandedCode = ref<string | null>(null)

const updatedAt = computed(() => (data.value.length ? data.value[0]!.date : ''))
const hasStaleError = computed(() => Boolean(error.value) && data.value.length > 0)

function toggleExpand(code: string) {
  expandedCode.value = expandedCode.value === code ? null : code
}

function onRefresh() {
  // 快照刷新后，历史缓存也一并失效
  invalidateHistoryCache()
  refresh()
}

onMounted(() => load())
</script>

<template>
  <section class="mx-auto min-h-screen max-w-6xl px-6 pt-28 pb-20 sm:pt-32">
    <router-link
      to="/projects"
      class="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] transition-colors hover:text-[var(--color-text)]"
    >
      <ArrowLeft :size="16" />
      返回项目
    </router-link>

    <header class="mt-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <p class="text-xs tracking-[0.3em] text-[var(--accent)] uppercase">
          CN Index Percentile
        </p>
        <h1 class="mt-3 text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl">
          A股分位观测站
        </h1>
        <p class="mt-4 max-w-xl text-base leading-relaxed text-[var(--color-text-muted)]">
          主要宽基指数估值百分位的每日观察。
        </p>
      </div>

      <div class="flex items-center gap-2 pb-1">
        <span v-if="updatedAt" class="font-mono text-xs text-[var(--color-text-muted)]">
          更新于 {{ updatedAt }}
        </span>
        <button
          type="button"
          class="icon-btn disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:scale-100"
          :disabled="isRefreshing"
          aria-label="刷新数据"
          title="刷新数据"
          @click="onRefresh"
        >
          <RefreshCw :size="16" :class="{ 'animate-spin motion-reduce:animate-none': isRefreshing }" />
        </button>
      </div>
    </header>

    <p v-if="hasStaleError" class="mt-4 text-xs text-[var(--danger)]">
      {{ error }}（当前展示的是上次获取的数据）
    </p>

    <div
      v-if="status === 'loading'"
      class="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-live="polite"
      aria-label="正在读取最新估值数据"
    >
      <ValuationSkeleton v-for="n in 3" :key="n" />
    </div>

    <StatePanel
      v-else-if="status === 'error'"
      class="mt-10"
      kind="error"
      :message="error"
      @retry="load(true)"
    />

    <StatePanel
      v-else-if="!data.length"
      class="mt-10"
      kind="empty"
      message="暂无估值数据"
    />

    <div
      v-else
      class="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      aria-label="指数估值百分位"
    >
      <ValuationCard
        v-for="item in data"
        :key="item.indexCode"
        :valuation="item"
        :expanded="expandedCode === item.indexCode"
        @toggle="toggleExpand(item.indexCode)"
      />
    </div>

    <footer
      class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-[var(--color-text-muted)]"
    >
      <span>百分位越高，代表当前估值在历史区间中的位置越高。</span>
      <span class="flex items-center gap-1.5">
        <i class="h-2 w-2 rounded-full bg-[var(--success)]"></i>
        ≤40% 相对低位
      </span>
      <span class="flex items-center gap-1.5">
        <i class="h-2 w-2 rounded-full bg-[var(--warning)]"></i>
        40%~80% 中位区间
      </span>
      <span class="flex items-center gap-1.5">
        <i class="h-2 w-2 rounded-full bg-[var(--danger)]"></i>
        ≥80% 相对高位
      </span>
    </footer>
  </section>
</template>
