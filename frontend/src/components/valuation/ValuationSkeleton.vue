<template>
  <div
    class="glass-panel animate-pulse rounded-2xl p-5 motion-reduce:animate-none"
    aria-hidden="true"
  >
    <div class="flex items-start justify-between gap-4">
      <div class="h-5 w-24 rounded bg-[var(--glass-bg-hover)]"></div>
      <div class="h-3 w-16 rounded bg-[var(--glass-bg-hover)]"></div>
    </div>

    <div class="mt-6 space-y-6">
      <div v-for="n in 2" :key="n">
        <div class="flex items-baseline justify-between">
          <div class="h-3 w-16 rounded bg-[var(--glass-bg-hover)]"></div>
          <div class="h-4 w-14 rounded bg-[var(--glass-bg-hover)]"></div>
        </div>
        <div class="mt-2 h-2 rounded-full bg-[var(--glass-bg-hover)]"></div>
      </div>
    </div>
  </div>
</template>
