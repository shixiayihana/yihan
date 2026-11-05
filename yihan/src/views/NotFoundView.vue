<script setup lang="ts">
import { ArrowLeft } from '@lucide/vue'
</script>

<template>
  <section class="flex min-h-screen flex-col items-center justify-center px-6 text-center">
    <p class="font-mono text-sm tracking-[0.3em] text-[var(--color-text-muted)]">404</p>
    <h1 class="mt-4 text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl">
      页面不存在
    </h1>
    <p class="mt-4 max-w-md text-base leading-relaxed text-[var(--color-text-muted)]">
      你要找的内容可能已经被移走了。
    </p>
    <router-link
      to="/"
      class="glass-pill mt-8 inline-flex items-center gap-2 px-5 py-2.5 text-sm text-[var(--color-text)] transition-transform duration-300 hover:scale-105"
    >
      <ArrowLeft :size="16" />
      返回首页
    </router-link>
  </section>
</template>
