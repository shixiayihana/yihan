import { getJson } from './http'

/** 后端原始结构（snake_case，日期字段名就叫 data） */
interface ValuationRaw {
  index_code: string
  index_name: string
  data: string
  pe_percentile: number
  pb_percentile: number
}

/** 前端内部结构（camelCase），组件只接触这个 */
export interface Valuation {
  indexCode: string
  indexName: string
  /** YYYY-MM-DD */
  date: string
  /** 0 ~ 1 */
  pePercentile: number
  /** 0 ~ 1 */
  pbPercentile: number
}

function normalize(raw: ValuationRaw): Valuation {
  return {
    indexCode: raw.index_code,
    indexName: raw.index_name,
    date: raw.data,
    pePercentile: raw.pe_percentile,
    pbPercentile: raw.pb_percentile,
  }
}

/** 所有指数的最新一期估值百分位 */
export async function getLatestValuations(signal?: AbortSignal): Promise<Valuation[]> {
  const rows = await getJson<ValuationRaw[]>('/valuations/latest', { signal })
  return rows.map(normalize)
}

/**
 * 单个指数的历史估值百分位。
 * 后端按日期倒序返回并截取最近 limit 条，这里统一转成时间正序，方便画图。
 */
export async function getValuationHistory(
  indexCode: string,
  limit: number,
  signal?: AbortSignal,
): Promise<Valuation[]> {
  const rows = await getJson<ValuationRaw[]>(
    `/valuations/${encodeURIComponent(indexCode)}?limit=${limit}`,
    { signal },
  )
  return rows.map(normalize).sort((a, b) => a.date.localeCompare(b.date))
}
