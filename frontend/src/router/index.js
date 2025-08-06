import { createRouter, createWebHistory } from "vue-router";

// Lazy load components for better performance
const Home = () => import("../views/Home.vue");
const Login = () => import("../views/Login.vue");
const Register = () => import("../views/Register.vue");
const UserList = () => import("../views/UserList.vue");
const DocGia = () => import("../views/DocGia.vue");
const Dashboard = () => import("../views/Dashboard.vue");

const SachNew = () => import("../views/SachNew.vue");
const NhaXuatBanNew = () => import("../views/NhaXuatBanNew.vue");
const TheoDoiMuonSach = () => import("../views/TheoDoiMuonSach.vue");
const AdminLayout = () => import("../layouts/AdminLayout.vue");

// Public interface components
const PublicLayout = () => import("../layouts/PublicLayout.vue");
const PublicHome = () => import("../views/PublicHome.vue");
const Categories = () => import("../views/Categories.vue");
const BooksList = () => import("../views/BooksList.vue");
const BookDetail = () => import("../views/BookDetail.vue");
const UserProfile = () => import("../views/UserProfile.vue");
const About = () => import("../views/About.vue");
const Contact = () => import("../views/Contact.vue");
const Help = () => import("../views/Help.vue");
const Privacy = () => import("../views/Privacy.vue");
const Terms = () => import("../views/Terms.vue");

const routes = [
  // Public routes with layout
  {
    path: "/",
    component: PublicLayout,
    children: [
      { path: "", name: "PublicHome", component: PublicHome },
      { path: "categories", name: "Categories", component: Categories },
      { path: "categories/:id", name: "CategoryBooks", component: BooksList },
      { path: "books", name: "Books", component: BooksList },
      { path: "books/:id", name: "BookDetail", component: BookDetail },
      { path: "profile", name: "UserProfile", component: UserProfile },
      { path: "my-borrows", name: "MyBorrows", component: UserProfile },
      { path: "borrow-history", name: "BorrowHistory", component: UserProfile },
      { path: "about", name: "About", component: About },
      { path: "contact", name: "Contact", component: Contact },
      { path: "help", name: "Help", component: Help },
      { path: "privacy", name: "Privacy", component: Privacy },
      { path: "terms", name: "Terms", component: Terms },
    ],
  },

  // Auth routes (standalone)
  { path: "/login", name: "Login", component: Login },
  { path: "/register", name: "Register", component: Register },

  // Admin routes with layout
  {
    path: "/admin",
    component: AdminLayout,
    children: [
      { path: "", name: "Dashboard", component: Dashboard },
      { path: "docgia", name: "DocGia", component: DocGia },
      { path: "sach", name: "Sach", component: SachNew },
      { path: "nhaxuatban", name: "NhaXuatBan", component: NhaXuatBanNew },
      { path: "users", name: "UserList", component: UserList },
      {
        path: "theodoimuonsach",
        name: "TheoDoiMuonSach",
        component: TheoDoiMuonSach,
      },
      { path: "thongke", name: "ThongKe", component: Dashboard },
      { path: "settings", name: "Settings", component: Dashboard },
      { path: "profile", name: "AdminProfile", component: Dashboard },
    ],
  },

];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for authentication - COMMENTED FOR TESTING
/* router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");

  // Public routes that don't require authentication
  const publicRoutes = [
    "/login",
    "/register",
    "/",
    "/categories",
    "/books",
    "/about",
    "/contact",
    "/help",
    "/privacy",
    "/terms",
  ];

  // Routes that require authentication
  const authRequiredRoutes = ["/profile", "/my-borrows", "/borrow-history"];

  // Admin routes
  const adminRoutes = ["/admin"];

  // Check if current route requires authentication
  const requiresAuth =
    authRequiredRoutes.some((route) => to.path.startsWith(route)) ||
    adminRoutes.some((route) => to.path.startsWith(route));

  // Check if it's a public route
  const isPublicRoute =
    publicRoutes.includes(to.path) ||
    to.path.startsWith("/categories/") ||
    to.path.startsWith("/books/");

  if (requiresAuth && !token) {
    // Redirect to login if authentication required but not authenticated
    next("/login");
  } else if ((to.path === "/login" || to.path === "/register") && token) {
    // Redirect authenticated users away from login/register
    // Check if user is admin or regular user
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      if (user.quyen && user.quyen.includes("quan_ly")) {
        next("/admin");
      } else {
        next("/");
      }
    } catch {
      next("/");
    }
  } else if (token && requiresAuth) {
    // Check token expiration for authenticated routes
    try {
      // Validate JWT token format and expiration
      const tokenParts = token.split(".");
      if (tokenParts.length !== 3) {
        throw new Error("Invalid token format");
      }

      // Decode and check expiration
      const payload = JSON.parse(
        atob(tokenParts[1].replace(/-/g, "+").replace(/_/g, "/"))
      );
      const currentTime = Date.now() / 1000;

      if (payload.exp && payload.exp < currentTime) {
        // Token expired
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        next("/login");
      } else {
        // Check admin access for admin routes
        if (to.path.startsWith("/admin")) {
          const user = JSON.parse(localStorage.getItem("user") || "{}");
          if (!user.quyen || !user.quyen.includes("quan_ly")) {
            next("/"); // Redirect non-admin users to home
          } else {
            next();
          }
        } else {
          next();
        }
      }
    } catch (error) {
      // Invalid token, clear storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      next("/login");
    }
  } else {
    next();
  }
});

export default router;
 */

export default router;