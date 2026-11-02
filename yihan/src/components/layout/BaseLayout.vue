<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import BackgroundImage from '@/components/background/BackgroundImage.vue'
import NavBar from '@/components/nav/NavBar.vue'
import MenuDrawer from '@/components/nav/MenuDrawer.vue'
import Snowfall from '@/components/effects/Snowfall.vue'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()

// Esc 关闭抽屉、主题菜单与音乐播放器
function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    ui.closeDrawer()
    ui.closeThemeMenu()
    ui.closeMusic()
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <div class="min-h-screen">
    <BackgroundImage />
    <NavBar />
    <MenuDrawer />
    <Snowfall />

    <main class="relative z-10">
      <router-view />
    </main>
  </div>
</template>
