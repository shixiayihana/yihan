<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
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
import { audioUrl, playlist } from '@/data/playlist'

const ui = useUiStore()

// 默认音量 50%
const DEFAULT_VOLUME = 0.5

const audioEl = ref<HTMLAudioElement | null>(null)

const currentIndex = ref(0)
const playing = ref(false)
const muted = ref(false)
// 默认列表循环：播完自动下一首，最后一首播完回到第一首
const playMode = ref<'list' | 'single'>('list')
const currentTime = ref(0)
const duration = ref(0)
const volume = ref(DEFAULT_VOLUME)
const audioError = ref(false)
// 打开音乐浮层时默认展开播放列表
const playlistOpen = ref(true)

const currentTrack = computed(() => playlist[currentIndex.value] ?? playlist[0]!)
const playModeLabel = computed(() => (playMode.value === 'list' ? '列表循环' : '单曲循环'))

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

// 首屏只加载元数据，等用户主动点播放
onMounted(() => {
  const a = audioEl.value
  if (!a) return
  a.volume = DEFAULT_VOLUME
  a.src = audioUrl(currentTrack.value.id)
})

/** 切换到指定曲目并开始播放 */
function loadTrack(index: number) {
  const a = audioEl.value
  const track = playlist[index]
  if (!a || !track) return
  currentIndex.value = index
  audioError.value = false
  currentTime.value = 0
  duration.value = 0
  a.src = audioUrl(track.id)
  a.load()
  a.play().catch(() => {})
}

function prevTrack() {
  const len = playlist.length
  loadTrack((currentIndex.value - 1 + len) % len)
}

function nextTrack() {
  loadTrack((currentIndex.value + 1) % playlist.length)
}

// 点击正在播放的曲目：暂停 / 继续；点击其他曲目：切歌
function onSelectTrack(index: number) {
  if (index === currentIndex.value) {
    togglePlay()
    return
  }
  loadTrack(index)
}

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

function togglePlayMode() {
  playMode.value = playMode.value === 'list' ? 'single' : 'list'
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

function onLoadedMetadata() {
  const a = audioEl.value
  if (!a) return
  duration.value = a.duration
  volume.value = a.volume
  muted.value = a.muted
}

function onTimeUpdate() {
  const a = audioEl.value
  if (a) currentTime.value = a.currentTime
}

// 播完：单曲循环重播当前曲目，列表循环切下一首（由 nextTrack 取模回到第一首）
function onEnded() {
  playing.value = false
  if (playMode.value === 'single') {
    const a = audioEl.value
    if (!a) return
    a.currentTime = 0
    a.play().catch(() => {})
    return
  }
  nextTrack()
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
    preload="metadata"
    @loadedmetadata="onLoadedMetadata"
    @timeupdate="onTimeUpdate"
    @play="playing = true"
    @pause="playing = false"
    @ended="onEnded"
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
          <p class="truncate text-base font-semibold text-[var(--color-text)]">
            {{ currentTrack.title }}
          </p>
          <p class="truncate text-xs text-[var(--color-text-muted)]">
            {{ currentTrack.artist }}
          </p>
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
          :aria-label="playModeLabel"
          :title="`${playModeLabel}（点击切换）`"
          @click="togglePlayMode()"
        >
          <component :is="playMode === 'list' ? Repeat : Repeat1" :size="18" />
        </button>

        <button
          class="icon-btn"
          type="button"
          aria-label="上一首"
          title="上一首"
          @click="prevTrack()"
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
          @click="nextTrack()"
        >
          <SkipForward :size="20" />
        </button>

        <button
          class="icon-btn"
          type="button"
          aria-label="播放列表"
          title="播放列表"
          :class="{ 'icon-btn--active': playlistOpen }"
          @click="playlistOpen = !playlistOpen"
        >
          <ListMusic :size="18" />
        </button>
      </div>

      <!-- 4. 播放列表 -->
      <div v-if="playlistOpen" class="mt-4 border-t border-[var(--glass-border)] pt-3">
        <div class="flex items-center justify-between px-1">
          <p
            class="font-mono text-[11px] tracking-wider text-[var(--color-text-muted)] uppercase"
          >
            播放列表
          </p>
          <p class="font-mono text-[11px] text-[var(--color-text-muted)]">
            {{ playlist.length }} 首
          </p>
        </div>

        <ul class="mt-2 max-h-56 space-y-0.5 overflow-y-auto">
          <li v-for="(track, index) in playlist" :key="track.id">
            <button
              type="button"
              class="flex w-full items-center gap-2 rounded-xl px-2 py-2 text-left transition-colors"
              :class="
                index === currentIndex
                  ? 'bg-[var(--accent-soft)]'
                  : 'hover:bg-[var(--glass-bg-hover)]'
              "
              :aria-current="index === currentIndex ? 'true' : undefined"
              @click="onSelectTrack(index)"
            >
              <span
                class="w-5 shrink-0 text-center font-mono text-xs"
                :class="
                  index === currentIndex
                    ? 'text-[var(--accent)]'
                    : 'text-[var(--color-text-muted)]'
                "
              >
                {{ index + 1 }}
              </span>
              <span class="min-w-0 flex-1">
                <span
                  class="block truncate text-sm"
                  :class="
                    index === currentIndex
                      ? 'font-medium text-[var(--accent)]'
                      : 'text-[var(--color-text)]'
                  "
                >
                  {{ track.title }}
                </span>
                <span class="block truncate text-xs text-[var(--color-text-muted)]">
                  {{ track.artist }}
                </span>
              </span>
              <span
                v-if="index === currentIndex"
                class="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--accent)]"
                aria-hidden="true"
              ></span>
            </button>
          </li>
        </ul>
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
