export type PercentLevel = 'low' | 'middle' | 'high'

/** 把 0~1 的百分位转成展示字符串，例如 0.3214 -> "32.14%" */
export function formatPercent(value: number, digits = 2): string {
  const percent = Math.min(100, Math.max(0, value * 100))
  return `${percent.toFixed(digits)}%`
}

/** 与源站一致的业务规则：≤40% 低位，40%~80% 中位，≥80% 高位 */
export function percentLevel(value: number): PercentLevel {
  const percent = value * 100
  if (percent <= 40) return 'low'
  if (percent < 80) return 'middle'
  return 'high'
}

export function percentLevelLabel(level: PercentLevel): string {
  return { low: '相对低位', middle: '中位区间', high: '相对高位' }[level]
}
