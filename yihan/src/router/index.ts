import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/about', name: 'about', component: () => import('@/views/AboutView.vue') },
    { path: '/blog', name: 'blog', component: () => import('@/views/BlogView.vue') },
    {
      path: '/projects',
      name: 'projects',
      component: () => import('@/views/ProjectsView.vue'),
    },
    {
      path: '/projects/cn-index-percentile',
      name: 'cn-index-percentile',
      component: () => import('@/views/projects/CnIndexPercentileView.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/views/NotFoundView.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router
