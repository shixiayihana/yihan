import { onBeforeUnmount, ref } from 'vue'
import { getLatestValuations, type Valuation } from '@/api/cn-index-percentile'
import { ApiError, isAbortError } from '@/api/http'

export type LoadStatus = 'idle' | 'loading' | 'success' | 'error'

const CACHE_KEY = 'yihan:valuations:latest:v1'
const CACHE_TTL = 5 * 60 * 1000

function readCache(): Valuation[] | null {
  try {
    const raw = sessionStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as { ts: number; data: Valuation[] }
    if (!Array.isArray(parsed.data) || Date.now() - parsed.ts > CACHE_TTL) return null
    return parsed.data
  } catch {
    return null
  }
}

function writeCache(items: Valuation[]) {
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify({ ts: Date.now(), data: items }))
  } catch {
    // 隐私模式 / 存储已满时忽略
  }
}

/**
 * 最新一期估值快照。
 * - 首次进入会读 5 分钟内的 sessionStorage 缓存
 * - 手动刷新会绕过缓存，并且保留旧数据，只置 isRefreshing
 */
export function useLatestValuations() {
  const data = ref<Valuation[]>([])
  const status = ref<LoadStatus>('idle')
  const error = ref('')
  const isRefreshing = ref(false)

  let controller: AbortController | null = null
  let requestId = 0

  async function load(force = false) {
    if (!force) {
      const cached = readCache()
      if (cached?.length) {
        data.value = cached
        status.value = 'success'
        return
      }
    }

    controller?.abort()
    controller = new AbortController()
    const id = ++requestId
    const firstLoad = data.value.length === 0

    if (firstLoad) status.value = 'loading'
    isRefreshing.value = !firstLoad
    error.value = ''

    try {
      const items = await getLatestValuations(controller.signal)
      if (id !== requestId) return
      data.value = items
      status.value = 'success'
      if (items.length) writeCache(items)
    } catch (err) {
      if (id !== requestId || isAbortError(err)) return
      error.value = err instanceof ApiError ? err.message : '数据暂时无法获取，请稍后重试'
      if (data.value.length === 0) status.value = 'error'
    } finally {
      if (id === requestId) {
        isRefreshing.value = false
        controller = null
      }
    }
  }

  function refresh() {
    return load(true)
  }

  onBeforeUnmount(() => {
    requestId += 1
    controller?.abort()
    controller = null
  })

  return { data, status, error, isRefreshing, load, refresh }
}
