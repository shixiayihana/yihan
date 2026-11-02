<script setup lang="ts">
import { computed, ref } from 'vue'
import { Search, Headphones, Sun, Moon, Monitor, Menu } from '@lucide/vue'
import { useThemeStore } from '@/stores/theme'
import { useUiStore } from '@/stores/ui'
import { useClickOutside } from '@/composables/useClickOutside'
import ThemeMenu from './ThemeMenu.vue'
import MusicPlayer from './MusicPlayer.vue'

const theme = useThemeStore()
const ui = useUiStore()

const themeMenuRef = ref<HTMLElement | null>(null)
useClickOutside(themeMenuRef, () => ui.closeThemeMenu())

const musicMenuRef = ref<HTMLElement | null>(null)
useClickOutside(musicMenuRef, () => ui.closeMusic())

// 明暗按钮图标：直接反映当前 mode
const themeIcon = computed(() => {
  switch (theme.mode) {
    case 'dark':
      return Moon
    case 'light':
      return Sun
    default:
      return Monitor
  }
})
</script>

<template>
  <div class="glass-pill flex items-center gap-1 px-2 py-1.5">
    <!-- 搜索（占位） -->
    <button class="icon-btn" type="button" aria-label="搜索" title="搜索（开发中）">
      <Search :size="18" />
    </button>

    <!-- 音乐播放器 -->
    <div ref="musicMenuRef" class="relative">
      <button
        class="icon-btn"
        type="button"
        aria-label="音乐"
        title="音乐"
        @click="ui.toggleMusic()"
      >
        <Headphones :size="18" />
      </button>
      <MusicPlayer />
    </div>

    <!-- 主题 / 强调色按钮暂未启用（占位）
    <button class="icon-btn" type="button" aria-label="主题" title="主题（开发中）">
      <Palette :size="18" />
    </button>
    -->

    <!-- 明暗切换：弹出 亮色 / 暗色 / 跟随系统 -->
    <div ref="themeMenuRef" class="relative">
      <button
        class="icon-btn"
        type="button"
        aria-label="切换主题"
        title="切换主题"
        @click="ui.toggleThemeMenu()"
      >
        <component :is="themeIcon" :size="18" />
      </button>
      <ThemeMenu />
    </div>

    <!-- 菜单抽屉 -->
    <button
      class="icon-btn"
      type="button"
      aria-label="菜单"
      title="菜单"
      @click="ui.toggleDrawer()"
    >
      <Menu :size="18" />
    </button>
  </div>
</template>
