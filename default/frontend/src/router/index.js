import { createRouter, createWebHistory } from 'vue-router';
import adminRoutes from './adminRoutes.js';
import publicRoutes from './publicRoutes.js';

const routes = [
  ...publicRoutes,
  ...adminRoutes,
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token');
  // Public routes that don't require authentication
  const publicPaths = ['/', '/login', '/register'];
  if (!isAuthenticated && !publicPaths.includes(to.path)) {
    next('/login');
  } else {
    next();
  }
});

export default router;
