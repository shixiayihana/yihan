<script setup lang="ts">
import { ArrowUpRight } from '@lucide/vue'
import type { ProjectItem } from '@/data/projects'

defineProps<{ project: ProjectItem }>()
</script>

<template>
  <router-link
    :to="`/projects/${project.slug}`"
    class="glass-panel group flex flex-col rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
  >
    <div class="flex items-start justify-between gap-4">
      <p class="font-mono text-xs tracking-wider text-[var(--color-text-muted)] uppercase">
        {{ project.tag }} · {{ project.year }}.{{ project.month }}
      </p>
      <ArrowUpRight
        :size="18"
        class="shrink-0 text-[var(--color-text-muted)] transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-[var(--accent)]"
      />
    </div>

    <h2 class="mt-5 text-xl font-semibold text-[var(--color-text)]">{{ project.title }}</h2>
    <p class="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
      {{ project.description }}
    </p>
  </router-link>
</template>
