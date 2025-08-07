import { createRouter, createWebHistory } from "vue-router";

// Lazy load components for better performance
const Home = () => import("../views/Home.vue");
const Login = () => import("../views/Login.vue");
const Register = () => import("../views/Register.vue");
const UserList = () => import("../views/UserList.vue");
const DocGia = () => import("../views/DocGia.vue");
const NhanVien = () => import("../views/NhanVien.vue");
const Dashboard = () => import("../views/Dashboard.vue");

const SachNew = () => import("../views/SachNew.vue");
const NhaXuatBanNew = () => import("../views/NhaXuatBanNew.vue");
const TheoDoiMuonSach = () => import("../views/TheoDoiMuonSach.vue");
const AdminLayout = () => import("../layouts/AdminLayout.vue");
const PhieuDangKy = () => import("../views/PhieuDangKy.vue");

// Public interface components
const PublicLayout = () => import("../layouts/PublicLayout.vue");
const PublicHome = () => import("../views/PublicHome.vue");
const BooksList = () => import("../views/BooksList.vue");
const BookDetail = () => import("../views/BookDetail.vue");
const Profile = () => import("../views/Profile.vue");
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
      { path: "categories/:id", name: "CategoryBooks", component: BooksList },
      { path: "books", name: "Books", component: BooksList },
      { path: "books/:id", name: "BookDetail", component: BookDetail },
      { path: "profile", name: "Profile", component: Profile },
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
      { path: "nhanvien", name: "NhanVien", component: NhanVien },
      { path: "sach", name: "Sach", component: SachNew },
      { path: "nhaxuatban", name: "NhaXuatBan", component: NhaXuatBanNew },
      { path: "users", name: "UserList", component: UserList },
      {
        path: "theodoimuonsach",
        name: "TheoDoiMuonSach",
        component: TheoDoiMuonSach,
      },
      {
        path: "phieudangky",
        name: "PhieuDangKy",
        component: PhieuDangKy,
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

// Navigation guard for authentication
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

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

  // Routes that require reader authentication
  const readerAuthRoutes = ["/profile", "/my-borrows", "/borrow-history"];

  // Admin routes that require staff authentication
  const adminRoutes = ["/admin"];

  // Check if current route requires authentication
  const requiresReaderAuth = readerAuthRoutes.some((route) =>
    to.path.startsWith(route)
  );
  const requiresAdminAuth = adminRoutes.some((route) =>
    to.path.startsWith(route)
  );

  // Check if it's a public route
  const isPublicRoute =
    publicRoutes.includes(to.path) ||
    to.path.startsWith("/categories/") ||
    to.path.startsWith("/books/");

  if ((requiresReaderAuth || requiresAdminAuth) && !token) {
    // Redirect to login if authentication required but not authenticated
    next({ path: "/login", query: { redirect: to.fullPath } });
  } else if ((to.path === "/login" || to.path === "/register") && token) {
    // Redirect authenticated users away from login/register
    if (userRole === "staff") {
      next("/admin");
    } else {
      next("/");
    }
  } else if (token && (requiresReaderAuth || requiresAdminAuth)) {
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
        localStorage.removeItem("userRole");
        next({ path: "/login", query: { redirect: to.fullPath } });
      } else {
        // Check role-based access
        if (requiresAdminAuth && userRole !== "staff") {
          // Admin route but not staff user
          next("/");
        } else if (requiresReaderAuth && userRole !== "reader") {
          // Reader route but not reader user
          next("/admin");
        } else {
          next();
        }
      }
    } catch (error) {
      // Invalid token, clear storage and redirect to login
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      next({ path: "/login", query: { redirect: to.fullPath } });
    }
  } else {
    next();
  }
});

export default router;
