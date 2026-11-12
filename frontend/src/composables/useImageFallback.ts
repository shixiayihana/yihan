import { computed, ref } from 'vue'

const DEFAULT_FORMATS = ['jpg', 'jpeg', 'png', 'webp', 'avif'] as const

/**
 * 多格式图片回退：给定基础文件名（不含后缀），按 formats 顺序逐个尝试加载，
 * 前一个失败时调用 advance() 尝试下一个格式，全部失败则 failed 变为 true。
 *
 * 用法：
 *   const { src, failed, advance } = useImageFallback('background')
 *   <img v-if="!failed" :src="src" @error="advance" />
 */
export function useImageFallback(
  name: string,
  formats: readonly string[] = DEFAULT_FORMATS,
) {
  const sources = formats.map((f) => `/${name}.${f}`)
  const index = ref(0)
  const failed = ref(false)

  const src = computed(() => sources[index.value] ?? sources[0] ?? '')

  function advance() {
    if (index.value < sources.length - 1) {
      index.value += 1
    } else {
      failed.value = true
    }
  }

  return { src, failed, advance }
}
