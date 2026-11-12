import { ref } from 'vue'
import { getValuationHistory, type Valuation } from '@/api/cn-index-percentile'
import { ApiError, isAbortError } from '@/api/http'

export const HISTORY_RANGES = [
  { key: '3m', label: '近3月', limit: 60 },
  { key: '1y', label: '近1年', limit: 250 },
  { key: '3y', label: '近3年', limit: 750 },
] as const

export type HistoryRange = (typeof HISTORY_RANGES)[number]['key']

const CACHE_TTL = 10 * 60 * 1000

/** 模块级缓存：同一指数同一区间在 10 分钟内只请求一次 */
const cache = new Map<string, { ts: number; data: Valuation[] }>()

export function invalidateHistoryCache() {
  cache.clear()
}

/**
 * 单个指数的历史走势，按需加载（卡片展开时才请求）。
 * 每个卡片实例独立持有 loading / error 状态。
 */
export function useValuationHistory(indexCode: string) {
  const data = ref<Valuation[]>([])
  const range = ref<HistoryRange>('1y')
  const isLoading = ref(false)
  const error = ref('')

  let controller: AbortController | null = null
  let requestId = 0

  function limitOf(key: HistoryRange) {
    return HISTORY_RANGES.find((item) => item.key === key)?.limit ?? 250
  }

  async function load(next: HistoryRange = range.value, force = false) {
    range.value = next
    const limit = limitOf(next)
    const cacheKey = `${indexCode}:${limit}`

    if (!force) {
      const hit = cache.get(cacheKey)
      if (hit && Date.now() - hit.ts < CACHE_TTL) {
        data.value = hit.data
        error.value = ''
        isLoading.value = false
        return
      }
    }

    controller?.abort()
    controller = new AbortController()
    const id = ++requestId
    isLoading.value = true
    error.value = ''

    try {
      const items = await getValuationHistory(indexCode, limit, controller.signal)
      if (id !== requestId) return
      data.value = items
      cache.set(cacheKey, { ts: Date.now(), data: items })
    } catch (err) {
      if (id !== requestId || isAbortError(err)) return
      error.value = err instanceof ApiError ? err.message : '历史数据加载失败'
    } finally {
      if (id === requestId) {
        isLoading.value = false
        controller = null
      }
    }
  }

  /** 卡片收起 / 卸载时取消在途请求 */
  function dispose() {
    requestId += 1
    controller?.abort()
    controller = null
    isLoading.value = false
  }

  return { data, range, isLoading, error, load, dispose }
}
