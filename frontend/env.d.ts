/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** API 基础地址，默认 /api */
  readonly VITE_API_BASE?: string
  /** 本地开发时 vite 代理目标 */
  readonly VITE_PROXY_TARGET?: string
}
