<script setup lang="ts">
import BrandPill from './BrandPill.vue'
import ControlsPill from './ControlsPill.vue'
</script>

<template>
  <!-- L2：顶部悬浮导航，左右两个独立胶囊，中间留空透出网格 -->
  <header class="fixed inset-x-0 top-0 z-50 px-4 pt-4 sm:px-6">
    <nav class="flex items-start justify-between">
      <BrandPill />
      <ControlsPill />
    </nav>
  </header>
</template>
