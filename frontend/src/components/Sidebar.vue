<template>
  <div class="sidebar" :class="{ 'sidebar-collapsed': collapsed }">
    <div class="sidebar-header">
      <div class="sidebar-brand">
        <i class="bi bi-book-half"></i>
        <span v-if="!collapsed" class="brand-text">Quản lý mượn sách</span>
      </div>
      <button class="sidebar-toggle" @click="toggleSidebar" :title="collapsed ? 'Mở rộng' : 'Thu gọn'">
        <i class="bi" :class="collapsed ? 'bi-chevron-right' : 'bi-chevron-left'"></i>
      </button>
    </div>

    <nav class="sidebar-nav">
      <ul class="nav-list">
        <li class="nav-item" v-for="item in menuItems" :key="item.name">
          <router-link :to="item.path" class="nav-link" :class="{ 'active': isActive(item.path) }"
            @click="handleNavClick">
            <i class="nav-icon" :class="item.icon"></i>
            <span v-if="!collapsed" class="nav-text">{{ item.label }}</span>
            <span v-if="item.badge && !collapsed" class="nav-badge" :class="item.badgeClass">
              {{ item.badge }}
            </span>
          </router-link>
        </li>
      </ul>
    </nav>

    <div v-if="!collapsed" class="sidebar-footer">
      <div class="user-info">
        <div class="user-avatar">
          <i class="bi bi-person-circle"></i>
        </div>
        <div class="user-details">
          <div class="user-name">{{ user?.HoTenNV || 'Admin' }}</div>
          <div class="user-role">{{ user?.ChucVu || 'Quản trị viên' }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'nav-click'])

const route = useRoute()
const collapsed = ref(props.modelValue)
const user = ref(null)

// Menu items - show all tabs for all users
const menuItems = computed(() => {
  return [
    {
      name: 'dashboard',
      path: '/admin',
      label: 'Thống kê',
      icon: 'bi bi-speedometer2'
    },
    {
      name: 'docgia',
      path: '/admin/docgia',
      label: 'Độc giả',
      icon: 'bi bi-people'
    },
    {
      name: 'nhanvien',
      path: '/admin/nhanvien',
      label: 'Nhân viên',
      icon: 'bi bi-person-badge'
    },
    {
      name: 'sach',
      path: '/admin/sach',
      label: 'Sách',
      icon: 'bi bi-book'
    },
    {
      name: 'nhaxuatban',
      path: '/admin/nhaxuatban',
      label: 'Nhà xuất bản',
      icon: 'bi bi-building'
    },
    {
      name: 'theodoimuonsach',
      path: '/admin/theodoimuonsach',
      label: 'Mượn trả sách',
      icon: 'bi bi-arrow-repeat'
    },
    {
      name: 'phieudangky',
      path: '/admin/phieudangky',
      label: 'Phiếu đăng ký',
      icon: 'bi bi-clipboard-check'
    }
  ]
})

// Load user info from localStorage
onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    try {
      user.value = JSON.parse(userData)
    } catch (error) {
      console.error('Error parsing user data:', error)
    }
  }
})

const toggleSidebar = () => {
  collapsed.value = !collapsed.value
  emit('update:modelValue', collapsed.value)
}

const isActive = (path) => {
  if (path === '/admin') {
    return route.path === '/admin'
  }
  return route.path.startsWith(path)
}

const handleNavClick = () => {
  emit('nav-click')
}
</script>

<style scoped>
.sidebar {
  width: 250px;
  height: 100vh;
  background: linear-gradient(180deg, #4e73df 0%, #224abe 100%);
  color: white;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 1000;
  transition: width 0.3s ease;
  display: flex;
  flex-direction: column;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
}

.sidebar-collapsed {
  width: 70px;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 70px;
}

.sidebar-brand {
  display: flex;
  align-items: center;
  font-size: 1.2rem;
  font-weight: bold;
}

.sidebar-brand i {
  font-size: 1.5rem;
  margin-right: 0.5rem;
}

.brand-text {
  white-space: nowrap;
  overflow: hidden;
}

.sidebar-toggle {
  background: none;
  border: none;
  color: white;
  font-size: 1rem;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: background-color 0.2s;
}

.sidebar-toggle:hover {
  background-color: rgba(255, 255, 255, 0.1);
}

.sidebar-nav {
  flex: 1;
  padding: 1rem 0;
  overflow-y: auto;
}

.nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.nav-item {
  margin-bottom: 0.25rem;
}

.nav-link {
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  transition: all 0.2s;
  position: relative;
}

.nav-link:hover {
  color: white;
  background-color: rgba(255, 255, 255, 0.1);
  text-decoration: none;
}

.nav-link.active {
  color: white;
  background-color: rgba(255, 255, 255, 0.2);
}

.nav-link.active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 3px;
  background-color: white;
}

.nav-icon {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
  margin-right: 0.75rem;
}

.nav-text {
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
}

.nav-badge {
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 1rem;
  background-color: #e74a3b;
  color: white;
  margin-left: auto;
}

.sidebar-footer {
  padding: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  font-size: 2rem;
  margin-right: 0.75rem;
  opacity: 0.8;
}

.user-details {
  flex: 1;
  min-width: 0;
}

.user-name {
  font-weight: 600;
  font-size: 0.9rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.user-role {
  font-size: 0.75rem;
  opacity: 0.7;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* Responsive */
@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.show {
    transform: translateX(0);
  }
}
</style>