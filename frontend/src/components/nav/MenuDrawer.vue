<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import type { Component } from 'vue'
import { X, House, User, BookOpen, Layers } from '@lucide/vue'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()
const route = useRoute()

const links: { to: string; label: string; icon: Component }[] = [
  { to: '/', label: '首页', icon: House },
  { to: '/about', label: '关于', icon: User },
  { to: '/blog', label: '博客', icon: BookOpen },
  { to: '/projects', label: '项目', icon: Layers },
]

function isActive(to: string) {
  // 嵌套路由（如 /projects/xxx）也要让「项目」保持高亮
  return route.path === to || (to !== '/' && route.path.startsWith(`${to}/`))
}

// 抽屉打开时锁定背景滚动
watch(
  () => ui.drawerOpen,
  (open) => {
    document.body.style.overflow = open ? 'hidden' : ''
  },
)
</script>

<template>
  <Teleport to="body">
    <!-- 遮罩 -->
    <Transition name="fade">
      <div
        v-if="ui.drawerOpen"
        class="fixed inset-0 z-[60] bg-black/20 backdrop-blur-sm dark:bg-black/40"
        @click="ui.closeDrawer()"
      ></div>
    </Transition>

    <!-- 右侧全高侧边抽屉 -->
    <Transition name="slide-right">
      <aside
        v-if="ui.drawerOpen"
        class="glass-panel fixed right-0 top-0 z-[70] flex h-full w-72 flex-col rounded-l-3xl p-6"
      >
        <div class="mb-8 flex items-center justify-between">
          <span class="text-sm font-semibold tracking-wide text-[var(--color-text)]">导航</span>
          <button
            class="icon-btn"
            type="button"
            aria-label="关闭菜单"
            @click="ui.closeDrawer()"
          >
            <X :size="18" />
          </button>
        </div>

        <nav class="flex flex-col gap-1">
          <router-link
            v-for="link in links"
            :key="link.to"
            :to="link.to"
            class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors"
            :class="
              isActive(link.to)
                ? 'bg-[var(--glass-bg-hover)] text-[var(--color-text)]'
                : 'text-[var(--color-text-muted)] hover:bg-[var(--glass-bg-hover)] hover:text-[var(--color-text)]'
            "
            @click="ui.closeDrawer()"
          >
            <component :is="link.icon" :size="18" class="shrink-0" />
            <span>{{ link.label }}</span>
          </router-link>
        </nav>

        <!-- 预留：后续功能入口 -->
        <div class="mt-auto">
          <div class="mb-4 h-px w-full bg-[var(--glass-border)]"></div>
          <p class="text-xs text-[var(--color-text-muted)]">更多功能即将上线</p>
        </div>
      </aside>
    </Transition>
  </Teleport>
</template>
