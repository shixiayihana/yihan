/**
 * 轻量 HTTP 封装：统一 baseURL、超时、错误归类。
 * 页面与 composable 只需要关心 ApiError 的 kind / message。
 */

export type ApiErrorKind = 'timeout' | 'network' | 'http' | 'parse'

export class ApiError extends Error {
  readonly kind: ApiErrorKind
  readonly status?: number

  constructor(kind: ApiErrorKind, message: string, status?: number) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
  }
}

export function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

const API_BASE = (import.meta.env.VITE_API_BASE || '/api').replace(/\/+$/, '')

export interface RequestOptions {
  /** 超时时间，默认 8 秒 */
  timeout?: number
  /** 外部取消信号（组件卸载 / 切换请求时使用） */
  signal?: AbortSignal
}

export async function getJson<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { timeout = 8000, signal } = options
  const controller = new AbortController()
  let timedOut = false

  const timer = window.setTimeout(() => {
    timedOut = true
    controller.abort()
  }, timeout)

  const onExternalAbort = () => controller.abort()
  if (signal) {
    if (signal.aborted) controller.abort()
    else signal.addEventListener('abort', onExternalAbort, { once: true })
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      signal: controller.signal,
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw new ApiError('http', `服务返回 ${response.status}`, response.status)
    }

    try {
      return (await response.json()) as T
    } catch {
      throw new ApiError('parse', '数据格式异常')
    }
  } catch (error) {
    if (error instanceof ApiError) throw error

    // 调用方主动取消：原样抛出，由调用方判断并忽略
    if (signal?.aborted) throw error

    if (timedOut) throw new ApiError('timeout', '请求超时，请稍后重试')
    throw new ApiError('network', '网络连接失败，请检查网络后重试')
  } finally {
    window.clearTimeout(timer)
    signal?.removeEventListener('abort', onExternalAbort)
  }
}
