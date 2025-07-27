<template>
    <div>
        <!-- Header Section -->
        <header class="header-section">
            <div class="container-fluid">
                <div class="row align-items-center">
                    <div class="col-md-4">
                        <div class="brand-section">
                            <div class="logo">
                                <i class="bi bi-book"></i>
                            </div>
                            <div class="brand-info">
                                <h1>Quản Lý Mượn Sách</h1>
                                <p>Hệ thống quản lý thư viện</p>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <nav class="main-navigation">
                            <ul class="nav nav-pills justify-content-center">
                                <li class="nav-item">
                                    <router-link to="/admin" class="nav-link" active-class="active">
                                        <i class="bi bi-speedometer2"></i>
                                        Dashboard
                                    </router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link to="/admin/users" class="nav-link" active-class="active">
                                        <i class="bi bi-people"></i>
                                        Độc giả
                                    </router-link>
                                </li>
                                <li class="nav-item">
                                    <router-link to="/admin/sach" class="nav-link" active-class="active">
                                        <i class="bi bi-book"></i>
                                        Sách
                                    </router-link>
                                </li>
                            </ul>
                        </nav>
                    </div>

                    <div class="col-md-4">
                        <div class="admin-profile">
                            <div class="admin-info">
                                <p class="admin-name">{{ currentUser.name || 'Admin' }}</p>
                                <a href="#" @click.prevent="logout" class="logout-btn">
                                    <i class="bi bi-box-arrow-right me-1"></i>Đăng xuất
                                </a>
                            </div>
                            <div
                                class="profile-img d-flex align-items-center justify-content-center bg-primary text-white">
                                <i class="bi bi-person"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>

        <!-- Main Content Area -->
        <div class="container-fluid">
            <div class="row">
                <!-- Sidebar -->
                <div class="col-md-3 col-lg-2">
                    <div class="sidebar-container">
                        <div class="card">
                            <div class="card-body p-0">
                                <div class="sidebar-menu">
                                    <!-- Quản lý cơ bản -->
                                    <div class="menu-section">
                                        <button class="menu-header" @click="toggleSection('basic')"
                                            :aria-expanded="expandedSections.basic">
                                            <i class="bi bi-gear"></i>
                                            Quản lý cơ bản
                                            <i class="bi bi-chevron-down ms-auto"></i>
                                        </button>
                                        <div class="collapse" :class="{ show: expandedSections.basic }">
                                            <div class="submenu">
                                                <router-link to="/admin/users" class="submenu-item">
                                                    <i class="bi bi-people"></i>
                                                    Quản lý độc giả
                                                </router-link>
                                                <router-link to="/admin/sach" class="submenu-item">
                                                    <i class="bi bi-book"></i>
                                                    Quản lý sách
                                                </router-link>
                                                <router-link to="/admin/nhaxuatban" class="submenu-item">
                                                    <i class="bi bi-building"></i>
                                                    Nhà xuất bản
                                                </router-link>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Mượn trả sách -->
                                    <div class="menu-section">
                                        <button class="menu-header" @click="toggleSection('borrow')"
                                            :aria-expanded="expandedSections.borrow">
                                            <i class="bi bi-arrow-repeat"></i>
                                            Mượn trả sách
                                            <i class="bi bi-chevron-down ms-auto"></i>
                                        </button>
                                        <div class="collapse" :class="{ show: expandedSections.borrow }">
                                            <div class="submenu">
                                                <router-link to="/admin/theodoimuonsach" class="submenu-item">
                                                    <i class="bi bi-list-check"></i>
                                                    Theo dõi mượn sách
                                                </router-link>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Báo cáo thống kê -->
                                    <div class="menu-section">
                                        <button class="menu-header" @click="toggleSection('reports')"
                                            :aria-expanded="expandedSections.reports">
                                            <i class="bi bi-graph-up"></i>
                                            Báo cáo & Thống kê
                                            <i class="bi bi-chevron-down ms-auto"></i>
                                        </button>
                                        <div class="collapse" :class="{ show: expandedSections.reports }">
                                            <div class="submenu">
                                                <router-link to="/admin" class="submenu-item">
                                                    <i class="bi bi-speedometer2"></i>
                                                    Dashboard
                                                </router-link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Main Content -->
                <div class="col-md-9 col-lg-10">
                    <div class="main-content">
                        <router-view />
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const currentUser = ref({
    name: 'Admin User',
    role: 'Administrator'
})

const expandedSections = ref({
    basic: true,
    borrow: false,
    reports: false
})

const toggleSection = (section) => {
    expandedSections.value[section] = !expandedSections.value[section]
}

const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/login')
}

onMounted(() => {
    // Load user info from localStorage
    const userInfo = localStorage.getItem('user')
    if (userInfo) {
        currentUser.value = JSON.parse(userInfo)
    }
})
</script>

<style scoped>
@import '../assets/main_admin.css';
</style>