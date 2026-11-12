<script setup lang="ts">
import ProjectCard from '@/components/project/ProjectCard.vue'
import { projects } from '@/data/projects'
</script>

<template>
  <section class="mx-auto min-h-screen max-w-6xl px-6 pt-28 pb-20 sm:pt-32">
    <p class="text-xs tracking-[0.3em] text-[var(--color-text-muted)] uppercase">Projects</p>
    <h1 class="mt-3 text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-5xl">
      项目
    </h1>
    <p class="mt-4 max-w-xl text-base leading-relaxed text-[var(--color-text-muted)]">
      一些自用的小工具与实验。
    </p>

    <div class="mt-10 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <ProjectCard v-for="project in projects" :key="project.slug" :project="project" />
    </div>
  </section>
</template>
