<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Volume2,
  VolumeX,
  Volume1,
  Repeat,
  Repeat1,
  ListMusic,
  SkipBack,
  SkipForward,
  Play,
  Pause,
  Disc3,
} from '@lucide/vue'
import { useUiStore } from '@/stores/ui'

const ui = useUiStore()

// 网易云直链音频（iframe 播放器内部实际使用的音频源）
const AUDIO_SRC = '//music.163.com/song/media/outer/url?id=1999180.mp3'

const audioEl = ref<HTMLAudioElement | null>(null)

const playing = ref(false)
const muted = ref(false)
const loop = ref(false)
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(1)
const audioError = ref(false)

const progressPercent = computed(() =>
  duration.value ? (currentTime.value / duration.value) * 100 : 0,
)

function formatTime(s: number) {
  if (!Number.isFinite(s) || s < 0) s = 0
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}
const currentTimeLabel = computed(() => formatTime(currentTime.value))
const totalTimeLabel = computed(() => formatTime(duration.value))

function togglePlay() {
  const a = audioEl.value
  if (!a) return
  if (a.paused) {
    a.play().catch(() => {})
  } else {
    a.pause()
  }
}

function toggleMute() {
  const a = audioEl.value
  if (!a) return
  a.muted = !a.muted
  muted.value = a.muted
}

function toggleLoop() {
  const a = audioEl.value
  if (!a) return
  a.loop = !a.loop
  loop.value = a.loop
}

function onSeek(e: Event) {
  const a = audioEl.value
  const input = e.target as HTMLInputElement
  if (!a || !duration.value) return
  a.currentTime = (Number(input.value) / 100) * duration.value
}

function onVolume(e: Event) {
  const a = audioEl.value
  const input = e.target as HTMLInputElement
  const v = Number(input.value)
  volume.value = v
  if (a) a.volume = v
}

// 单曲场景：上一首 / 下一首 均回到开头重播
function restart() {
  const a = audioEl.value
  if (!a) return
  a.currentTime = 0
  if (a.paused) a.play().catch(() => {})
}

function onLoadedMetadata() {
  const a = audioEl.value
  if (!a) return
  duration.value = a.duration
  volume.value = a.volume
  muted.value = a.muted
  loop.value = a.loop
}

function onTimeUpdate() {
  const a = audioEl.value
  if (a) currentTime.value = a.currentTime
}

function onAudioError() {
  audioError.value = true
  playing.value = false
}
</script>

<template>
  <!-- 隐藏的音频元素：始终挂载，关闭浮层后音乐仍可继续播放 -->
  <audio
    ref="audioEl"
    :src="AUDIO_SRC"
    preload="metadata"
    @loadedmetadata="onLoadedMetadata"
    @timeupdate="onTimeUpdate"
    @play="playing = true"
    @pause="playing = false"
    @ended="playing = false"
    @error="onAudioError"
  ></audio>

  <Transition name="theme-menu">
    <div
      v-if="ui.musicOpen"
      class="glass-panel absolute right-0 top-full mt-2 w-[330px] max-w-[calc(100vw-3rem)] rounded-3xl p-5"
    >
      <!-- 1. 顶部：媒体信息区 -->
      <div class="flex items-center gap-3">
        <span
          class="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--glass-border)] bg-[var(--accent-soft)] text-[var(--accent)] shadow-md"
          :class="{ 'spin-slow': playing }"
        >
          <Disc3 :size="26" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="truncate text-base font-semibold text-[var(--color-text)]">Overworld Day</p>
          <p class="truncate text-xs text-[var(--color-text-muted)]">Scott Lloyd Shelly</p>
        </div>
        <button
          class="icon-btn"
          type="button"
          :aria-label="muted ? '取消静音' : '静音'"
          :title="muted ? '取消静音' : '静音'"
          @click="toggleMute()"
        >
          <component :is="muted ? VolumeX : Volume2" :size="18" />
        </button>
      </div>

      <!-- 2. 中部：进度与状态区 -->
      <div class="mt-4">
        <div
          class="flex items-center justify-between font-mono text-xs text-[var(--color-text-muted)]"
        >
          <span>{{ currentTimeLabel }}</span>
          <span>{{ totalTimeLabel }}</span>
        </div>

        <!-- 主进度条（可拖动） -->
        <input
          type="range"
          min="0"
          max="100"
          step="0.1"
          :value="progressPercent"
          :disabled="!duration"
          class="mt-1.5 w-full cursor-pointer accent-[var(--accent)]"
          aria-label="播放进度"
          @input="onSeek"
        />

        <!-- 音量控制 -->
        <div class="mt-2 flex items-center gap-2">
          <Volume1 :size="16" class="shrink-0 text-[var(--color-text-muted)]" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            :value="volume"
            class="w-full cursor-pointer accent-[var(--accent)]"
            aria-label="音量"
            @input="onVolume"
          />
        </div>

        <p v-if="audioError" class="mt-2 text-xs text-[var(--color-text-muted)]">
          音频加载失败（可能该歌曲不允许外链）
        </p>
      </div>

      <!-- 3. 底部：播放控制区 -->
      <div class="mt-5 flex items-center justify-between">
        <button
          class="icon-btn"
          type="button"
          aria-label="循环模式"
          title="循环模式"
          :class="{ 'icon-btn--active': loop }"
          @click="toggleLoop()"
        >
          <component :is="loop ? Repeat1 : Repeat" :size="18" />
        </button>

        <button
          class="icon-btn"
          type="button"
          aria-label="上一首"
          title="上一首"
          @click="restart()"
        >
          <SkipBack :size="20" />
        </button>

        <button
          type="button"
          :aria-label="playing ? '暂停' : '播放'"
          :title="playing ? '暂停' : '播放'"
          class="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[var(--accent)] text-[var(--accent)] transition-transform hover:scale-105 active:scale-95"
          @click="togglePlay()"
        >
          <component :is="playing ? Pause : Play" :size="20" />
        </button>

        <button
          class="icon-btn"
          type="button"
          aria-label="下一首"
          title="下一首"
          @click="restart()"
        >
          <SkipForward :size="20" />
        </button>

        <button class="icon-btn" type="button" aria-label="播放列表" title="播放列表">
          <ListMusic :size="18" />
        </button>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.spin-slow {
  animation: spin-slow 8s linear infinite;
}
@keyframes spin-slow {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
