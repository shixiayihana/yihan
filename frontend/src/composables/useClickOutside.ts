import { onMounted, onBeforeUnmount, type Ref } from 'vue'

/**
 * 点击目标元素外部时触发 handler（常用于下拉菜单/弹层点击外部关闭）。
 */
export function useClickOutside(
  target: Ref<HTMLElement | null>,
  handler: () => void,
) {
  function onClick(e: MouseEvent) {
    const el = target.value
    if (el && e.target instanceof Node && !el.contains(e.target)) {
      handler()
    }
  }

  onMounted(() => document.addEventListener('mousedown', onClick))
  onBeforeUnmount(() => document.removeEventListener('mousedown', onClick))
}
