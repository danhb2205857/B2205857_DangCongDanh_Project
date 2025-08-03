import { createRouter, createWebHistory } from 'vue-router';

// Lazy load components for better performance
const Home = () => import('../views/Home.vue');
const Login = () => import('../views/Login.vue');
const Register = () => import('../views/Register.vue');
const UserList = () => import('../views/UserList.vue');
const DocGia = () => import('../views/DocGia.vue');
const Dashboard = () => import('../views/Dashboard.vue');
const Sach = () => import('../views/Sach.vue');
const SachNew = () => import('../views/SachNew.vue');
const NhaXuatBan = () => import('../views/NhaXuatBan.vue');
const NhaXuatBanNew = () => import('../views/NhaXuatBanNew.vue');
const TheoDoiMuonSach = () => import('../views/TheoDoiMuonSach.vue');
const AdminLayout = () => import('../layouts/AdminLayout.vue');

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
      { path: 'docgia', name: 'DocGia', component: DocGia },
      { path: 'sach', name: 'Sach', component: SachNew },
      { path: 'nhaxuatban', name: 'NhaXuatBan', component: NhaXuatBanNew },
      { path: 'users', name: 'UserList', component: UserList },
      { path: 'theodoimuonsach', name: 'TheoDoiMuonSach', component: TheoDoiMuonSach },
      { path: 'thongke', name: 'ThongKe', component: Dashboard },
      { path: 'settings', name: 'Settings', component: Dashboard },
      { path: 'profile', name: 'Profile', component: Dashboard },
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