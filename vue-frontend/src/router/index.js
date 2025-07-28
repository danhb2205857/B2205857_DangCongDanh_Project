import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import UserList from '../views/UserList.vue';
import Dashboard from '../views/Dashboard.vue';
import Sach from '../views/Sach.vue';
import NhaXuatBan from '../views/NhaXuatBan.vue';
import TheoDoiMuonSach from '../views/TheoDoiMuonSach.vue';
import AdminLayout from '../layouts/AdminLayout.vue';

const routes = [
  { path: '/', name: 'Home', component: Home },
  { path: '/login', name: 'Login', component: Login },
  { path: '/register', name: 'Register', component: Register },
  
  // Admin routes with layout
  {
    path: '/admin',
    component: AdminLayout,
    children: [
      { path: '', name: 'Dashboard', component: Dashboard },
      { path: 'sach', name: 'Sach', component: Sach },
      { path: 'nhaxuatban', name: 'NhaXuatBan', component: NhaXuatBan },
      { path: 'users', name: 'UserList', component: UserList },
      { path: 'theodoimuonsach', name: 'TheoDoiMuonSach', component: TheoDoiMuonSach },
    ]
  },
  
  // Legacy routes for backward compatibility
  { path: '/users', name: 'UserListLegacy', component: UserList },
  { path: '/sach', name: 'SachLegacy', component: Sach },
  { path: '/nhaxuatban', name: 'NhaXuatBanLegacy', component: NhaXuatBan },
  { path: '/theodoimuonsach', name: 'TheoDoiMuonSachLegacy', component: TheoDoiMuonSach },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  
  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/'];
  
  // Check if route requires authentication
  const requiresAuth = !publicRoutes.includes(to.path);
  
  if (requiresAuth && !token) {
    // Redirect to login if not authenticated
    next('/login');
  } else if (!requiresAuth && token) {
    // Redirect authenticated users away from login/register
    if (to.path === '/login' || to.path === '/register') {
      next('/admin');
    } else {
      next();
    }
  } else {
    // Check token expiration for authenticated routes
    if (token && requiresAuth) {
      try {
        // Validate JWT token format and expiration
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
          throw new Error('Invalid token format');
        }
        
        // Decode and check expiration
        const payload = JSON.parse(atob(tokenParts[1].replace(/-/g, '+').replace(/_/g, '/')));
        const currentTime = Date.now() / 1000;
        
        if (payload.exp && payload.exp < currentTime) {
          // Token expired
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          next('/login');
        } else {
          next();
        }
      } catch (error) {
        // Invalid token, clear storage and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        next('/login');
      }
    } else {
      next();
    }
  }
});

export default router;