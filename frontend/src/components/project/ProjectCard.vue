<script setup lang="ts">
import type { ProjectItem } from '@/data/projects'

defineProps<{ project: ProjectItem }>()
</script>

<template>
  <router-link
    :to="`/projects/${project.slug}`"
    class="glass-panel flex flex-col rounded-2xl p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
  >
    <p class="font-mono text-xs tracking-wider text-[var(--color-text-muted)] uppercase">
      {{ project.tag }} · {{ project.year }}.{{ project.month }}
    </p>

    <h2 class="mt-5 text-xl font-semibold text-[var(--color-text)]">{{ project.title }}</h2>
    <p class="mt-2 text-sm leading-relaxed text-[var(--color-text-muted)]">
      {{ project.description }}
    </p>
  </router-link>
</template>
