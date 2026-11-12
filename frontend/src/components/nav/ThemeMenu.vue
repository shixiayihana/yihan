<script setup lang="ts">
import { Sun, Moon, Monitor, Check } from '@lucide/vue'
import type { Component } from 'vue'
import { useThemeStore, type ThemeMode } from '@/stores/theme'
import { useUiStore } from '@/stores/ui'

const theme = useThemeStore()
const ui = useUiStore()

const options: { value: ThemeMode; label: string; icon: Component }[] = [
  { value: 'light', label: '亮色', icon: Sun },
  { value: 'dark', label: '暗色', icon: Moon },
  { value: 'system', label: '跟随系统', icon: Monitor },
]

function select(mode: ThemeMode) {
  theme.setMode(mode)
  ui.closeThemeMenu()
}
</script>

<template>
  <Transition name="theme-menu">
    <div
      v-if="ui.themeMenuOpen"
      class="glass-panel absolute right-0 top-full mt-2 w-48 rounded-2xl p-1.5"
    >
      <button
        v-for="opt in options"
        :key="opt.value"
        type="button"
        class="flex w-full items-center gap-2.5 rounded-xl px-3 py-2 text-left text-sm text-[var(--color-text)] transition-colors hover:bg-[var(--glass-bg-hover)]"
        @click="select(opt.value)"
      >
        <component :is="opt.icon" :size="16" class="shrink-0 text-[var(--color-text-muted)]" />
        <span class="flex-1">{{ opt.label }}</span>
        <!-- 未选中「跟随系统」时，提示当前系统状态 -->
        <span
          v-if="opt.value === 'system' && theme.mode !== 'system'"
          class="shrink-0 text-xs text-[var(--color-text-muted)]"
        >
          {{ theme.systemDark ? '当前暗色' : '当前亮色' }}
        </span>
        <Check
          v-if="theme.mode === opt.value"
          :size="16"
          class="shrink-0 text-[var(--color-text)]"
        />
      </button>
    </div>
  </Transition>
</template>
