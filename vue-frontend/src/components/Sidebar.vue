<template>
    <nav class="sidebar" :class="{ 'sidebar-collapsed': isCollapsed }" v-if="!loading">
        <div class="sidebar-header">
            <button class="btn btn-link sidebar-toggle" @click="toggleSidebar"
                :title="isCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'">
                <i class="fas fa-bars"></i>
            </button>
        </div>

        <div class="sidebar-content">
            <ul class="nav nav-pills flex-column">
                <!-- Dashboard -->
                <li class="nav-item">
                    <router-link to="/admin" class="nav-link" :class="{ active: $route.path === '/admin' }">
                        <i class="fas fa-tachometer-alt nav-icon"></i>
                        <span class="nav-text">Dashboard</span>
                    </router-link>
                </li>

                <!-- Quản lý độc giả -->
                <li class="nav-item">
                    <router-link to="/admin/docgia" class="nav-link"
                        :class="{ active: $route.path.includes('/docgia') }">
                        <i class="fas fa-users nav-icon"></i>
                        <span class="nav-text">Quản lý độc giả</span>
                    </router-link>
                </li>

                <!-- Quản lý sách -->
                <li class="nav-item">
                    <router-link to="/admin/sach" class="nav-link" :class="{ active: $route.path.includes('/sach') }">
                        <i class="fas fa-book nav-icon"></i>
                        <span class="nav-text">Quản lý sách</span>
                    </router-link>
                </li>

                <!-- Quản lý nhà xuất bản -->
                <li class="nav-item">
                    <router-link to="/admin/nhaxuatban" class="nav-link"
                        :class="{ active: $route.path.includes('/nhaxuatban') }">
                        <i class="fas fa-building nav-icon"></i>
                        <span class="nav-text">Nhà xuất bản</span>
                    </router-link>
                </li>

                <!-- Theo dõi mượn sách -->
                <li class="nav-item">
                    <router-link to="/admin/theodoimuonsach" class="nav-link"
                        :class="{ active: $route.path.includes('/theodoimuonsach') }">
                        <i class="fas fa-exchange-alt nav-icon"></i>
                        <span class="nav-text">Mượn trả sách</span>
                    </router-link>
                </li>

                <!-- Quản lý nhân viên (chỉ admin) -->
                <li class="nav-item" v-if="!loading && canManageUsers">
                    <router-link to="/admin/users" class="nav-link" :class="{ active: $route.path.includes('/users') }">
                        <i class="fas fa-user-tie nav-icon"></i>
                        <span class="nav-text">Quản lý nhân viên</span>
                    </router-link>
                </li>

                <!-- Divider -->
                <li class="nav-divider"></li>

                <!-- Thống kê -->
                <li class="nav-item">
                    <router-link to="/admin/thongke" class="nav-link"
                        :class="{ active: $route.path.includes('/thongke') }">
                        <i class="fas fa-chart-bar nav-icon"></i>
                        <span class="nav-text">Thống kê</span>
                    </router-link>
                </li>

                <!-- Cài đặt -->
                <li class="nav-item">
                    <router-link to="/admin/settings" class="nav-link"
                        :class="{ active: $route.path.includes('/settings') }">
                        <i class="fas fa-cog nav-icon"></i>
                        <span class="nav-text">Cài đặt</span>
                    </router-link>
                </li>
            </ul>
        </div>
    </nav>
    <div v-else class="sidebar-loading">
        <div class="text-center p-3">
            <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const { currentUser, isAuthenticated } = useAuth()

const isCollapsed = ref(false)
const loading = ref(true)

const canManageUsers = computed(() => {
    try {
        if (!currentUser || !currentUser.value) return false
        const user = currentUser.value
        if (!user || typeof user !== 'object') return false

        return user.chucVu === 'Quản lý thư viện' ||
            (Array.isArray(user.quyen) && user.quyen.includes('quan_ly'))
    } catch (error) {
        console.warn('Error checking user permissions:', error)
        return false
    }
})

const toggleSidebar = () => {
    isCollapsed.value = !isCollapsed.value
    // Save state to localStorage
    localStorage.setItem('sidebarCollapsed', isCollapsed.value.toString())
}

// Restore sidebar state from localStorage
onMounted(() => {
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) {
        isCollapsed.value = saved === 'true'
    }
    loading.value = false
})
</script>

<style scoped>
.sidebar {
    width: 250px;
    min-height: 100vh;
    background: #343a40;
    transition: width 0.3s ease;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    overflow-x: hidden;
}

.sidebar-collapsed {
    width: 60px;
}

.sidebar-header {
    padding: 1rem;
    border-bottom: 1px solid #495057;
}

.sidebar-toggle {
    color: #fff;
    border: none;
    background: none;
    font-size: 1.2rem;
    padding: 0.5rem;
    border-radius: 0.25rem;
    transition: background-color 0.15s ease;
}

.sidebar-toggle:hover {
    background-color: #495057;
    color: #fff;
}

.sidebar-content {
    padding: 1rem 0;
}

.nav-pills .nav-link {
    color: #adb5bd;
    border-radius: 0;
    padding: 0.75rem 1rem;
    margin: 0.125rem 0.5rem;
    border-radius: 0.375rem;
    transition: all 0.15s ease;
    display: flex;
    align-items: center;
    white-space: nowrap;
}

.nav-pills .nav-link:hover {
    background-color: #495057;
    color: #fff;
}

.nav-pills .nav-link.active {
    background-color: #0d6efd;
    color: #fff;
}

.nav-icon {
    width: 20px;
    text-align: center;
    margin-right: 0.75rem;
    flex-shrink: 0;
}

.nav-text {
    transition: opacity 0.3s ease;
}

.sidebar-collapsed .nav-text {
    opacity: 0;
    width: 0;
    overflow: hidden;
}

.sidebar-collapsed .nav-icon {
    margin-right: 0;
}

.nav-divider {
    height: 1px;
    background-color: #495057;
    margin: 0.5rem 1rem;
}

/* Responsive */
@media (max-width: 991.98px) {
    .sidebar {
        transform: translateX(-100%);
        transition: transform 0.3s ease;
    }

    .sidebar.show {
        transform: translateX(0);
    }
}

/* Tooltip for collapsed sidebar */
.sidebar-collapsed .nav-link {
    position: relative;
}

.sidebar-collapsed .nav-link:hover::after {
    content: attr(title);
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    background: #000;
    color: #fff;
    padding: 0.25rem 0.5rem;
    border-radius: 0.25rem;
    font-size: 0.875rem;
    white-space: nowrap;
    z-index: 1001;
    margin-left: 0.5rem;
}
</style>