<script setup lang="ts">
import { useImageFallback } from '@/composables/useImageFallback'

// L0：全屏背景图（fixed，滚动时不动）
// 图片路径：public/background.{jpg|jpeg|png|webp|avif}；未放置前回退到网格纹理
const { src: bgSrc, failed: bgFailed, advance: nextBg } = useImageFallback('background')
</script>

<template>
  <div class="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
    <img
      v-if="!bgFailed"
      :src="bgSrc"
      alt=""
      class="h-full w-full object-cover"
      @error="nextBg"
    />

    <!-- 未放图时的回退：网格纹理 -->
    <div v-else class="grid-bg h-full w-full"></div>

    <!-- 可读性遮罩 -->
    <div class="absolute inset-0 bg-[var(--overlay)]"></div>
  </div>
</template>

<style scoped>
.grid-bg {
  background-image:
    repeating-linear-gradient(
      to right,
      var(--color-grid) 0,
      var(--color-grid) 1px,
      transparent 1px,
      transparent 40px
    ),
    repeating-linear-gradient(
      to bottom,
      var(--color-grid) 0,
      var(--color-grid) 1px,
      transparent 1px,
      transparent 40px
    );
  -webkit-mask-image: radial-gradient(
    ellipse 120% 100% at 50% 40%,
    black 0%,
    black 55%,
    transparent 100%
  );
  mask-image: radial-gradient(
    ellipse 120% 100% at 50% 40%,
    black 0%,
    black 55%,
    transparent 100%
  );
}
</style>
