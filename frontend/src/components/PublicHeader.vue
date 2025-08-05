<template>
  <header>
    <nav class="navbar navbar-expand-lg bg-body-tertiary fixed-top shadow-sm">
      <div class="container-fluid">
        <!-- Brand -->
        <router-link to="/" class="navbar-brand d-flex align-items-center">
          <img src="/images/logo.png" alt="Thư viện" class="logo me-2" @error="handleLogoError">
          <span class="fw-bold">Thư viện sách</span>
        </router-link>

        <!-- Mobile toggle -->
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div class="collapse navbar-collapse" id="navbarSupportedContent">
          <!-- Main Navigation -->
          <ul class="navbar-nav me-auto mb-2 mb-lg-0">
            <li class="nav-item">
              <router-link to="/" class="nav-link" :class="{ active: $route.name === 'PublicHome' }">
                <i class="fas fa-home me-1"></i>
                Trang chủ
              </router-link>
            </li>

            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="categoriesDropdown" role="button"
                data-bs-toggle="dropdown" aria-expanded="false"
                :class="{ active: $route.name === 'Categories' || $route.name === 'CategoryBooks' }">
                <i class="fas fa-tags me-1"></i>
                Nhà xuất bản
              </a>
              <ul class="dropdown-menu" aria-labelledby="categoriesDropdown">
                <li>
                  <router-link to="/categories" class="dropdown-item">
                    <i class="fas fa-list me-2"></i>
                    Tất cả nhà xuất bản
                  </router-link>
                </li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li v-for="category in topCategories" :key="category.MaNhaXuatBan">
                  <router-link :to="`/categories/${category.MaNhaXuatBan}`" class="dropdown-item">
                    {{ category.TenNhaXuatBan }}
                  </router-link>
                </li>
                <li v-if="topCategories.length === 0">
                  <span class="dropdown-item text-muted">Đang tải...</span>
                </li>
              </ul>
            </li>

            <li class="nav-item">
              <router-link to="/books" class="nav-link" :class="{ active: $route.name === 'Books' }">
                <i class="fas fa-book me-1"></i>
                Tất cả sách
              </router-link>
            </li>

            <li class="nav-item">
              <router-link to="/about" class="nav-link" :class="{ active: $route.name === 'About' }">
                <i class="fas fa-info-circle me-1"></i>
                Giới thiệu
              </router-link>
            </li>

            <li class="nav-item">
              <router-link to="/contact" class="nav-link" :class="{ active: $route.name === 'Contact' }">
                <i class="fas fa-phone me-1"></i>
                Liên hệ
              </router-link>
            </li>
          </ul>

          <!-- Search Form -->
          <form class="d-flex mx-auto search-form" @submit.prevent="handleSearch">
            <div class="input-group">
              <input v-model="searchQuery" class="form-control" type="search" placeholder="Tìm kiếm sách..."
                aria-label="Search">
              <button class="btn btn-outline-primary" type="submit">
                <i class="fas fa-search"></i>
              </button>
            </div>
          </form>

          <!-- User Menu -->
          <ul class="navbar-nav mb-2 mb-lg-0 ms-3">
            <li class="nav-item dropdown" v-if="isAuthenticated">
              <a class="nav-link dropdown-toggle d-flex align-items-center" href="#" role="button"
                data-bs-toggle="dropdown" aria-expanded="false">
                <img :src="user.avatar || '/images/avatar-default.svg'" alt="Avatar"
                  class="rounded-circle me-2 user-avatar" @error="handleAvatarError">
                <span class="me-2">{{ user.HoLot }} {{ user.Ten }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <router-link to="/profile" class="dropdown-item">
                    <i class="fas fa-user me-2"></i>Trang cá nhân
                  </router-link>
                </li>
                <li>
                  <router-link to="/my-borrows" class="dropdown-item">
                    <i class="fas fa-book me-2"></i>Sách đang mượn
                  </router-link>
                </li>
                <li>
                  <router-link to="/borrow-history" class="dropdown-item">
                    <i class="fas fa-history me-2"></i>Lịch sử mượn
                  </router-link>
                </li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li>
                  <button @click="logout" class="dropdown-item">
                    <i class="fas fa-sign-out-alt me-2"></i>Đăng xuất
                  </button>
                </li>
              </ul>
            </li>

            <li class="nav-item dropdown" v-else>
              <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown"
                aria-expanded="false">
                <i class="fas fa-user-circle me-1"></i>
                Tài khoản
              </a>
              <ul class="dropdown-menu dropdown-menu-end">
                <li>
                  <router-link to="/login" class="dropdown-item">
                    <i class="fas fa-sign-in-alt me-2"></i>Đăng nhập
                  </router-link>
                </li>
                <li>
                  <router-link to="/register" class="dropdown-item">
                    <i class="fas fa-user-plus me-2"></i>Đăng ký
                  </router-link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>

    <!-- Success/Error Messages -->
    <div v-if="message" class="alert-container">
      <div class="alert alert-dismissible fade show"
        :class="messageType === 'success' ? 'alert-success' : 'alert-danger'" role="alert">
        <i :class="messageType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'" class="me-2"></i>
        {{ message }}
        <button type="button" class="btn-close" @click="clearMessage" aria-label="Close"></button>
      </div>
    </div>
  </header>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'
import axios from '@/utils/axios'
export default {
  setup() {
    const router = useRouter()
    const { user, isAuthenticated, logout: authLogout } = useAuth()

    const searchQuery = ref('')
    const topCategories = ref([])
    const message = ref('')
    const messageType = ref('success')

    const loadTopCategories = async () => {
      try {
        const response = await axios.get('/api/nhaxuatban?limit=5&sortBy=TenNhaXuatBan')
        topCategories.value = response.data.data.nhaxuatban || []
      } catch (error) {
        console.error('Error loading categories:', error)
      }
    }

    const handleSearch = () => {
      if (searchQuery.value.trim()) {
        router.push({
          name: 'Books',
          query: { search: searchQuery.value.trim() }
        })
        searchQuery.value = ''
      }
    }

    const logout = async () => {
      try {
        await authLogout()
        showMessage('Đăng xuất thành công!', 'success')
        router.push('/')
      } catch (error) {
        console.error('Logout error:', error)
        showMessage('Có lỗi xảy ra khi đăng xuất!', 'error')
      }
    }

    const showMessage = (msg, type = 'success') => {
      message.value = msg
      messageType.value = type

      setTimeout(() => {
        clearMessage()
      }, 5000)
    }

    const clearMessage = () => {
      message.value = ''
      messageType.value = 'success'
    }

    const handleLogoError = (event) => {
      // Fallback to text if logo fails to load
      event.target.style.display = 'none'
    }

    const handleAvatarError = (event) => {
      // Fallback to default avatar
      event.target.src = '/images/avatar-default.svg'
    }

    // Listen for global messages
    const handleGlobalMessage = (event) => {
      if (event.detail) {
        showMessage(event.detail.message, event.detail.type)
      }
    }

    onMounted(() => {
      loadTopCategories()
      window.addEventListener('show-message', handleGlobalMessage)
    })

    return {
      searchQuery,
      topCategories,
      message,
      messageType,
      user,
      isAuthenticated,
      handleSearch,
      logout,
      clearMessage,
      handleLogoError,
      handleAvatarError
    }
  }
}
</script>

<style scoped>
.logo {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.search-form {
  max-width: 400px;
  width: 100%;
}

.user-avatar {
  width: 32px;
  height: 32px;
  object-fit: cover;
}

.navbar-nav .nav-link.active {
  color: #0d6efd !important;
  font-weight: 500;
}

.alert-container {
  position: fixed;
  top: 80px;
  right: 20px;
  z-index: 1050;
  min-width: 300px;
  max-width: 500px;
}

.dropdown-menu {
  border: none;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
}

.dropdown-item {
  padding: 0.5rem 1rem;
  transition: background-color 0.15s ease-in-out;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.dropdown-item i {
  width: 16px;
  text-align: center;
}

@media (max-width: 991.98px) {
  .search-form {
    margin: 1rem 0;
    max-width: none;
  }

  .navbar-nav {
    text-align: center;
  }

  .alert-container {
    right: 10px;
    left: 10px;
    min-width: auto;
  }
}

/* Custom scrollbar for dropdown */
.dropdown-menu {
  max-height: 300px;
  overflow-y: auto;
}

.dropdown-menu::-webkit-scrollbar {
  width: 4px;
}

.dropdown-menu::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.dropdown-menu::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 2px;
}

.dropdown-menu::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>