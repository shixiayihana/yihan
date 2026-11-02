import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  const drawerOpen = ref(false)
  const themeMenuOpen = ref(false)
  const musicOpen = ref(false)

  function toggleDrawer() {
    drawerOpen.value = !drawerOpen.value
    themeMenuOpen.value = false
    musicOpen.value = false
  }
  function closeDrawer() {
    drawerOpen.value = false
  }

  function toggleThemeMenu() {
    themeMenuOpen.value = !themeMenuOpen.value
    drawerOpen.value = false
    musicOpen.value = false
  }
  function closeThemeMenu() {
    themeMenuOpen.value = false
  }

  function toggleMusic() {
    musicOpen.value = !musicOpen.value
    drawerOpen.value = false
    themeMenuOpen.value = false
  }
  function closeMusic() {
    musicOpen.value = false
  }

  return {
    drawerOpen,
    themeMenuOpen,
    musicOpen,
    toggleDrawer,
    closeDrawer,
    toggleThemeMenu,
    closeThemeMenu,
    toggleMusic,
    closeMusic,
  }
})
