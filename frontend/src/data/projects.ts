export interface ProjectItem {
  /** 对应路由 /projects/:slug */
  slug: string
  title: string
  description: string
  tag: string
  year: string
  month: string
}

export const projects: ProjectItem[] = [
  {
    slug: 'cn-index-percentile',
    title: 'A股分位观测站',
    description: '每日自动爬取 A 股主要宽基指数的估值百分位，用一张图看清当前处在历史区间的什么位置。',
    tag: 'Tool',
    year: '2026',
    month: '08',
  },
]
