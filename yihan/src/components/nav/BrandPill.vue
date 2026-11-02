<script setup lang="ts">
import { useImageFallback } from '@/composables/useImageFallback'

// 头像图片：public/avatar.{jpg|jpeg|png|webp|avif}；未放置前显示「Y」字圆形占位
// 用绑定 :src 而非静态 src，避免 Vite 在构建期解析 public 资源
const { src: avatarSrc, failed: avatarFailed, advance: nextAvatar } =
  useImageFallback('avatar')
</script>

<template>
  <router-link
    to="/"
    class="glass-pill flex items-center gap-3 py-1.5 pl-1.5 pr-5"
  >
    <span
      class="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--color-grid)]"
    >
      <img
        v-if="!avatarFailed"
        :src="avatarSrc"
        alt="yihan"
        class="h-full w-full object-cover"
        @error="nextAvatar"
      />
      <span v-else class="text-sm font-semibold text-[var(--color-text)]">Y</span>
    </span>
    <span class="text-sm font-semibold tracking-wide text-[var(--color-text)]">
      yihan
    </span>
  </router-link>
</template>
