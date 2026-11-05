import { existsSync, readdirSync, rmSync } from 'node:fs'
import { resolve } from 'node:path'
import { fileURLToPath, URL } from 'node:url'

import { defineConfig, loadEnv } from 'vite'
import type { Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

/**
 * 宝塔会在网站根目录生成 .user.ini（以及 .well-known 等），
 * 这些文件不能随 dist 一起删除，否则构建会报 ENOTDIR。
 */
const KEEP_IN_OUT_DIR = new Set(['.user.ini', '.well-known', '.htaccess', '.gitkeep', '.DS_Store'])

/**
 * 替代 Vite 默认的 emptyOutDir：
 * 构建前清空 dist，但跳过需要保留的服务器文件。
 * 配合 build.emptyOutDir = false 使用。
 */
function cleanOutDirPlugin(): Plugin {
  let outDir = ''
  return {
    name: 'yihan:clean-out-dir',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    buildStart() {
      if (!existsSync(outDir)) return
      for (const entry of readdirSync(outDir)) {
        if (KEEP_IN_OUT_DIR.has(entry)) continue
        rmSync(resolve(outDir, entry), { recursive: true, force: true })
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // 读取 .env* 里的代理目标（本地开发时 /api 转发到 FastAPI）
  const env = loadEnv(mode, process.cwd(), '')
  const proxyTarget = env.VITE_PROXY_TARGET || 'http://127.0.0.1:8000'

  return {
    plugins: [
      vue(),
      // vueDevTools(),
      tailwindcss(),
      cleanOutDirPlugin(),
    ],
    build: {
      // 关闭 Vite 自带的清空逻辑，改为上面的插件选择性清空
      emptyOutDir: false,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
        },
      },
    },
  }
})
