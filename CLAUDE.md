# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 仓库布局

- `frontend/` — Vue 3 应用本体，所有前端代码都在这里
- `docs/` — 设计与实现参考：`yihan.md`（视觉规范）、`音乐播放器.md`、`樱花动画参考.md`、`网站歌单.md`；改对应区域前先读
- `deploy.sh` — 服务器部署脚本，见「部署」

## 常用命令

在 `frontend/` 目录下执行：

```bash
npm install
npm run dev          # 开发服务器，/api 代理到 VITE_PROXY_TARGET（默认 http://127.0.0.1:8000）
npm run build        # vue-tsc 类型检查 + vite build 并行执行
npm run type-check   # 仅类型检查
npm run build-only   # 仅打包
npm run format       # Prettier 格式化 src/
```

项目没有测试和 lint 配置，`npm run build` 是唯一的完整校验手段。Node 版本要求 `^22.18.0 || >=24.12.0`。

环境变量见 `.env.example`：`VITE_API_BASE`（默认 `/api`）、`VITE_PROXY_TARGET`（仅开发代理用）。`.env.local` 已被 gitignore。

## 技术栈

Vue 3 `<script setup lang="ts">` + Vite 8 + TypeScript + Tailwind CSS v4 + Pinia + Vue Router 5 + `@lucide/vue` 图标。

- Tailwind v4 是 CSS-first 配置：没有 `tailwind.config.*`，主题与工具类都在 `src/styles/main.css`。
- `tsconfig.app.json` 开启了 `noUncheckedIndexedAccess`，数组/对象索引结果可能是 `undefined`，取用时需要显式收窄。
- 路径别名 `@` → `src/`。

## 页面层级架构

整站是「固定背景 + 内容 + 覆盖层」的 z-index 栈，入口在 `src/components/layout/BaseLayout.vue`：

| z-index | 层 |
|---|---|
| 0 | `BackgroundImage` 全屏背景图 + `--overlay` 可读性遮罩 |
| 10 | `<main>` 路由内容 |
| 40 | `Snowfall` 全屏 Canvas（`pointer-events-none`） |
| 50 | 顶部导航 `NavBar` |
| 60 / 70 | `MenuDrawer` 遮罩 / 抽屉面板 |

- 背景容器用 `100vw`（`w-screen`）而不是 `inset-x-0`：页面高度不同会让滚动条出现/消失，用 `100vw` 才能保证 `object-cover` 的缩放不随切页变化。
- 所有颜色取自 `src/styles/main.css` 的 CSS 变量（亮/暗两套 token），组件里用 `var(--xxx)`，不要硬编码颜色；新增语义色时两套都要补。
- 玻璃质感统一复用 `.glass-pill` / `.glass-panel` / `.icon-btn`，抽屉、下拉浮层、卡片都建立在它们之上。

## 主题系统

- `src/stores/theme.ts`：`light | dark | system`，持久化到 `localStorage['yihan-theme']`，通过给 `<html>` 加 `.dark` 生效。
- `index.html` 里有挂载前的内联脚本，必须在首屏渲染前应用主题以避免闪烁；改主题逻辑时要同步改这里。
- Tailwind 的 `dark:` 变体由 `.dark` 类驱动（`@custom-variant dark`），不是 `prefers-color-scheme` 媒体查询。

## 状态管理

- `useThemeStore`：主题模式与系统暗色监听。
- `useUiStore`：抽屉 / 主题菜单 / 音乐浮层三个开关**互斥**，打开一个会自动关闭另外两个；`Esc` 关闭逻辑统一在 `BaseLayout`。

## 图片资源约定

`public/` 下的背景图和头像不写死扩展名：`useImageFallback('background')` / `useImageFallback('avatar')` 会依次尝试 `jpg → jpeg → png → webp → avif`，加载失败自动换下一个。

不要在模板里写 `src="/xxx.png"` 这样的静态绝对路径——Vite 会在构建期解析它，资源不存在会直接构建失败；用运行时绑定配合该 composable。

## 特效

`Snowfall.vue` 是原生 Canvas 2D 粒子系统，没有第三方库：离屏预渲染雪花 sprite + `drawImage`、delta time、边界回收、`devicePixelRatio` 适配、`prefers-reduced-motion` 时停用。雪花颜色随主题切换重建 sprite。修改时保持这些约束。

## 音乐播放器

`MusicPlayer.vue` 不用 iframe，直接用网易云外链音频 `//music.163.com/song/media/outer/url?id={id}.mp3`。歌单在 `src/data/playlist.ts`，默认列表循环。歌单 ID 由站点维护者验证过可用，不要在开发时主动请求验证（会受地区 / 版权限制）。

## A股分位模块

`/projects/cn-index-percentile` 是唯一有后端依赖的页面：

- API 层：`src/api/http.ts`（baseURL、8s 超时、`timeout/network/http/parse` 错误分类）+ `src/api/cn-index-percentile.ts`（snake_case → camelCase，历史数据转时间正序）。
- 快照与历史分别由 `useLatestValuations`（sessionStorage 缓存 5 分钟）和 `useValuationHistory`（卡片展开时才请求，模块级 Map 缓存 10 分钟）管理，都带 `AbortController`，切换/收起时取消在途请求。
- 阈值规则固定在 `src/utils/percent.ts`：`≤40%` 低位、`40%~80%` 中位、`≥80%` 高位；对应颜色 token 为 `--success/--warning/--danger`。
- 走势图是手写 SVG（`TrendChart.vue`），不要引入图表库。
- 生产环境按同源 `/api` 请求，依赖 nginx 反代到 FastAPI；若部署在子目录，还需要给 Vite 设置 `base`（路由已使用 `import.meta.env.BASE_URL`）。

## 构建产物与宝塔

`vite.config.ts` 用 `cleanOutDirPlugin` 手动清空 `dist`，并设置 `build.emptyOutDir = false`。原因是宝塔会在站点根目录生成 `.user.ini`，Vite 默认清空目录时删不掉它会报 `ENOTDIR` 导致构建失败。

保留清单在 `KEEP_IN_OUT_DIR`（`.user.ini`、`.well-known`、`.htaccess` 等），新增服务器文件时加进去。不要让 Vite 重新接管 `emptyOutDir`。

## 部署

`deploy.sh` 在服务器 `/www/wwwroot/www.11251236.xyz/yihan` 执行：从 **Gitee** 仓库拉取 `main`（`--ff-only`）后 `cd frontend && npm run build`。脚本不安装依赖，服务器需预先 `npm install`。

注意：本地 `origin` 指向 GitHub，而服务器拉取的是 Gitee，改动必须同步到 Gitee 才会生效。nginx 需要为 History 路由配置 `try_files $uri $uri/ /index.html;`，并把 `/api` 反代到 FastAPI（`proxy_pass` 末尾不要带 `/`）。
