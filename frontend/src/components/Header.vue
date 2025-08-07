<template>
    <header class="navbar navbar-expand-lg navbar-dark bg-primary">
        <div class="container-fluid">
            <!-- Brand -->
            <router-link to="/admin" class="navbar-brand">
                <img class="logo" src="/images/logo.png" alt="">
                Quản lý thư viện
            </router-link>

            <!-- Mobile toggle button -->
            <button class="navbar-toggler d-lg-none" type="button" @click="toggleMobileMenu"
                aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <!-- Right side menu -->
            <div class="navbar-nav ms-auto">
                <div class="nav-item dropdown position-relative">
                    <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button"
                        @click="toggleUserMenu" aria-expanded="false">
                        <i class="fas fa-user-circle me-2"></i>
                        <span>{{ currentUser?.hoTenNV || 'Admin' }}</span>
                    </a>
                    <ul class="dropdown-menu dropdown-menu-end" :class="{ show: showUserMenu }">
                        <li>
                            <router-link to="/admin/profile" class="dropdown-item">
                                <i class="fas fa-user me-2"></i>
                                Thông tin cá nhân
                            </router-link>
                        </li>
                        <li>
                            <a href="#" class="dropdown-item" @click="handleChangePassword">
                                <i class="fas fa-key me-2"></i>
                                Đổi mật khẩu
                            </a>
                        </li>
                        <li>
                            <hr class="dropdown-divider">
                        </li>
                        <li>
                            <a href="#" class="dropdown-item text-danger" @click="handleLogout">
                                <i class="fas fa-sign-out-alt me-2"></i>
                                Đăng xuất
                            </a>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { currentUser, logout } = useAuth()

const showUserMenu = ref(false)
const showMobileMenu = ref(false)

const toggleUserMenu = () => {
    showUserMenu.value = !showUserMenu.value
}

const toggleMobileMenu = () => {
    showMobileMenu.value = !showMobileMenu.value
}

const handleLogout = async () => {
    try {
        await logout()
        router.push('/login')
    } catch (error) {
        console.error('Logout error:', error)
    }
}

const handleChangePassword = () => {
    // TODO: Implement change password modal
    console.log('Change password clicked')
}

// Close dropdowns when clicking outside
const handleClickOutside = (event) => {
    if (!event.target.closest('.dropdown')) {
        showUserMenu.value = false
    }
}

onMounted(() => {
    document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.navbar-brand {
    font-weight: 600;
    font-size: 1.25rem;
}

.dropdown-menu {
    border: none;
    box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
    border-radius: 0.375rem;
    position: absolute;
    top: 100%;
    right: 0;
    left: auto;
    z-index: 1050;
    min-width: 200px;
    margin-top: 0.125rem;
    background-color: #fff;
    transform: translateX(0);
}

.dropdown-item {
    padding: 0.5rem 1rem;
    transition: background-color 0.15s ease-in-out;
}

.dropdown-item:hover {
    background-color: #f8f9fa;
}

.dropdown-item.text-danger:hover {
    background-color: #f8d7da;
    color: #721c24 !important;
}

.nav-item.dropdown {
    position: relative;
}

.dropdown-toggle {
    cursor: pointer;
    text-decoration: none;
    color: rgba(255, 255, 255, 0.75);
    transition: color 0.15s ease-in-out;
}

.dropdown-toggle:hover {
    color: #fff;
    text-decoration: none;
}

@media (max-width: 991.98px) {
    .navbar-brand {
        font-size: 1.1rem;
    }

    .dropdown-menu {
        right: 0.5rem;
        left: auto;
        min-width: 180px;
        transform: translateX(0);
    }

    .navbar-nav {
        position: relative;
    }
}
</style>