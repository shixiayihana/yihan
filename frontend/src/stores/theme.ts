import { ref, computed, watch } from 'vue'
import { defineStore } from 'pinia'

export type ThemeMode = 'light' | 'dark' | 'system'

const STORAGE_KEY = 'yihan-theme'

function getStoredMode(): ThemeMode {
  const v = localStorage.getItem(STORAGE_KEY)
  return v === 'light' || v === 'dark' || v === 'system' ? v : 'system'
}

function getSystemDark(): boolean {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

export const useThemeStore = defineStore('theme', () => {
  const mode = ref<ThemeMode>(getStoredMode())
  /** 系统当前是否为暗色（原始偏好，与 mode 无关） */
  const systemDark = ref(getSystemDark())

  /** 真正生效的暗色状态（system 模式时跟随系统） */
  const resolvedDark = computed(() =>
    mode.value === 'system' ? systemDark.value : mode.value === 'dark',
  )

  function apply() {
    document.documentElement.classList.toggle('dark', resolvedDark.value)
  }

  function setMode(m: ThemeMode) {
    mode.value = m
    localStorage.setItem(STORAGE_KEY, m)
  }

  // 系统主题变化时刷新（仅在 system 模式下会影响 resolvedDark）
  const mql = window.matchMedia('(prefers-color-scheme: dark)')
  mql.addEventListener('change', (e) => {
    systemDark.value = e.matches
  })

  watch(resolvedDark, apply, { immediate: true })

  return { mode, resolvedDark, systemDark, setMode }
})
