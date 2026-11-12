<script setup lang="ts">
import { Inbox, TriangleAlert } from '@lucide/vue'

withDefaults(
  defineProps<{
    kind?: 'error' | 'empty'
    message: string
  }>(),
  { kind: 'empty' },
)

defineEmits<{ retry: [] }>()
</script>

<template>
  <div
    class="glass-panel flex flex-col items-center gap-3 rounded-2xl px-6 py-12 text-center"
    role="status"
    aria-live="polite"
  >
    <component
      :is="kind === 'error' ? TriangleAlert : Inbox"
      :size="22"
      class="text-[var(--color-text-muted)]"
    />
    <p class="text-sm text-[var(--color-text)]">{{ message }}</p>
    <button
      v-if="kind === 'error'"
      type="button"
      class="rounded-full border border-[var(--glass-border)] px-4 py-1.5 text-sm text-[var(--color-text)] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent)]"
      @click="$emit('retry')"
    >
      重新加载
    </button>
  </div>
</template>
