<template>
  <header>
    <nav class="navbar navbar-expand-lg bg-body-tertiary fixed-top shadow-sm">
      <div class="container-fluid">
        <!-- Brand -->
        <router-link to="/" class="navbar-brand d-flex align-items-center">
          <img src="/images/logo.png" alt="Thư viện" class="logo me-2" @error="handleLogoError">
          <span class="fw-bold">CDBook</span>
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
                @click.prevent="toggleCategoriesDropdown"
                :aria-expanded="showCategoriesDropdown"
                :class="{ active: $route.name === 'Categories' || $route.name === 'CategoryBooks' }">
                <i class="fas fa-tags me-1"></i>
                Nhà xuất bản
              </a>
              <ul class="dropdown-menu" :class="{ show: showCategoriesDropdown }" aria-labelledby="categoriesDropdown">
                <li>
                  <router-link to="/categories" class="dropdown-item" @click="closeDropdowns">
                    <i class="fas fa-list me-2"></i>
                    Tất cả nhà xuất bản
                  </router-link>
                </li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li v-for="category in topCategories" :key="category.MaNhaXuatBan">
                  <router-link :to="`/categories/${category.MaNhaXuatBan}`" class="dropdown-item" @click="closeDropdowns">
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

            <!-- Borrow Registration Button - Only for authenticated users -->
            <li class="nav-item" v-if="isAuthenticated">
              <a href="#" @click.prevent="showBorrowRegistrationModal" class="nav-link">
                <i class="fas fa-book-reader me-1"></i>
                Đăng ký mượn sách
              </a>
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
                @click.prevent="toggleUserDropdown"
                :aria-expanded="showUserDropdown">
                <img :src="user.avatar || '/images/avatar-default.svg'" alt="Avatar"
                  class="rounded-circle me-2 user-avatar" @error="handleAvatarError">
                <span class="me-2">{{ user.HoLot }} {{ user.Ten }}</span>
              </a>
              <ul class="dropdown-menu dropdown-menu-end" :class="{ show: showUserDropdown }">
                <li>
                  <router-link to="/profile" class="dropdown-item" @click="closeDropdowns">
                    <i class="fas fa-user me-2"></i>Trang cá nhân
                  </router-link>
                </li>
                <li>
                  <hr class="dropdown-divider">
                </li>
                <li>
                  <button @click="handleLogout" class="dropdown-item">
                    <i class="fas fa-sign-out-alt me-2"></i>Đăng xuất
                  </button>
                </li>
              </ul>
            </li>

            <li class="nav-item dropdown" v-else>
              <a class="nav-link dropdown-toggle" href="#" role="button"
                @click.prevent="toggleUserDropdown"
                :aria-expanded="showUserDropdown">
                <i class="fas fa-user-circle me-1"></i>
                Tài khoản
              </a>
              <ul class="dropdown-menu dropdown-menu-end" :class="{ show: showUserDropdown }">
                <li>
                  <router-link to="/login" class="dropdown-item" @click="closeDropdowns">
                    <i class="fas fa-sign-in-alt me-2"></i>Đăng nhập
                  </router-link>
                </li>
                <li>
                  <router-link to="/register" class="dropdown-item" @click="closeDropdowns">
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

    <!-- Borrow Registration Modal -->
    <div class="modal-backdrop fade" :class="{ show: showBorrowModal }" v-show="showBorrowModal"></div>
    <div class="modal fade" :class="{ show: showBorrowModal }" style="display: block;" tabindex="-1" v-show="showBorrowModal" @click.self="closeBorrowModal">
      <div class="modal-dialog modal-lg" @click.stop>
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-book-reader me-2"></i>
              Đăng ký mượn sách
            </h5>
            <button type="button" class="btn-close" @click="closeBorrowModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitBorrowRegistration">
              <!-- Reader Info (Read-only) -->
              <div class="row mb-3">
                <div class="col-md-6">
                  <label class="form-label">Độc giả</label>
                  <input type="text" class="form-control" :value="user.HoLot && user.Ten" readonly>
                </div>
                <div class="col-md-6">
                  <label class="form-label">Mã độc giả</label>
                  <input type="text" class="form-control" :value="user.MaDocGia" readonly>
                </div>
              </div>

              <!-- Book Selection -->
              <div class="mb-3">
                <label class="form-label">Chọn sách <span class="text-danger">*</span></label>
                <select v-model="borrowForm.MaSach" class="form-select" :class="{ 'is-invalid': borrowErrors.MaSach }">
                  <option value="">-- Chọn sách --</option>
                  <option v-for="book in availableBooks" :key="book.MaSach" :value="book.MaSach">
                    {{ book.TenSach }} (Còn: {{ book.SoQuyenConLai || book.SoQuyen }})
                  </option>
                </select>
                <div v-if="borrowErrors.MaSach" class="invalid-feedback">{{ borrowErrors.MaSach }}</div>
              </div>

              <!-- Expected Return Date -->
              <div class="mb-3">
                <label class="form-label">Ngày hẹn trả <span class="text-danger">*</span></label>
                <input type="date" v-model="borrowForm.NgayHenTra" class="form-control" 
                       :class="{ 'is-invalid': borrowErrors.NgayHenTra }" :min="tomorrow">
                <div v-if="borrowErrors.NgayHenTra" class="invalid-feedback">{{ borrowErrors.NgayHenTra }}</div>
                <small class="form-text text-muted">Thời gian mượn tối đa 30 ngày</small>
              </div>

              <!-- Note -->
              <div class="mb-3">
                <label class="form-label">Ghi chú</label>
                <textarea v-model="borrowForm.GhiChu" class="form-control" rows="3" 
                          placeholder="Ghi chú thêm (không bắt buộc)"></textarea>
              </div>

              <!-- Warning -->
              <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Lưu ý:</strong> Đây là đăng ký mượn sách. Yêu cầu của bạn sẽ được gửi đến thư viện để xem xét và phê duyệt.
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeBorrowModal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="submitBorrowRegistration" :disabled="submitting">
              <i class="fas fa-paper-plane me-2"></i>
              {{ submitting ? 'Đang gửi...' : 'Gửi đăng ký' }}
            </button>
          </div>
        </div>
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
    const { user, isAuthenticated, logout } = useAuth()

    const searchQuery = ref('')
    const topCategories = ref([])
    const message = ref('')
    const messageType = ref('success')
    const showUserDropdown = ref(false)
    const showCategoriesDropdown = ref(false)
    const showBorrowModal = ref(false)
    const submitting = ref(false)
    const availableBooks = ref([])
    const borrowForm = ref({
      MaSach: '',
      NgayHenTra: '',
      GhiChu: ''
    })
    const borrowErrors = ref({})


    const loadTopCategories = async () => {
      try {
        const response = await axios.get('/nhaxuatban?limit=5&sortBy=TenNhaXuatBan')
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

    const handleLogout = async () => {
      await logout()
      closeDropdowns()
      router.push('/login')
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

    const toggleUserDropdown = () => {
      showUserDropdown.value = !showUserDropdown.value
      showCategoriesDropdown.value = false
    }

    const toggleCategoriesDropdown = () => {
      showCategoriesDropdown.value = !showCategoriesDropdown.value
      showUserDropdown.value = false
    }

    const closeDropdowns = () => {
      showUserDropdown.value = false
      showCategoriesDropdown.value = false
    }

    // Computed for tomorrow date
    const tomorrow = computed(() => {
      const date = new Date()
      date.setDate(date.getDate() + 1)
      return date.toISOString().split('T')[0]
    })

    // Load available books
    const loadAvailableBooks = async () => {
      try {
        const response = await axios.get('/sach/available')
        if (response.data.success) {
          availableBooks.value = response.data.data || []
        }
      } catch (error) {
        console.error('Error loading books:', error)
      }
    }

    // Show borrow registration modal
    const showBorrowRegistrationModal = async () => {
      await loadAvailableBooks()
      resetBorrowForm()
      showBorrowModal.value = true
      closeDropdowns()
      // Prevent body scroll
      document.body.style.overflow = 'hidden'
    }

    // Close borrow modal
    const closeBorrowModal = () => {
      showBorrowModal.value = false
      resetBorrowForm()
      // Restore body scroll
      document.body.style.overflow = ''
    }

    // Reset form
    const resetBorrowForm = () => {
      borrowForm.value = {
        MaSach: '',
        NgayHenTra: '',
        GhiChu: ''
      }
      borrowErrors.value = {}
    }

    // Validate form
    const validateBorrowForm = () => {
      borrowErrors.value = {}

      if (!borrowForm.value.MaSach) {
        borrowErrors.value.MaSach = 'Vui lòng chọn sách'
      }

      if (!borrowForm.value.NgayHenTra) {
        borrowErrors.value.NgayHenTra = 'Vui lòng chọn ngày hẹn trả'
      } else {
        const dueDate = new Date(borrowForm.value.NgayHenTra)
        const today = new Date()
        const maxDate = new Date()
        maxDate.setDate(today.getDate() + 30)

        if (dueDate <= today) {
          borrowErrors.value.NgayHenTra = 'Ngày hẹn trả phải sau ngày hôm nay'
        } else if (dueDate > maxDate) {
          borrowErrors.value.NgayHenTra = 'Thời gian mượn tối đa 30 ngày'
        }
      }

      return Object.keys(borrowErrors.value).length === 0
    }

    // Submit borrow registration
    const submitBorrowRegistration = async () => {
      if (!validateBorrowForm()) return

      submitting.value = true
      try {
        const requestData = {
          MaDocGia: user.value.MaDocGia,
          MaSach: borrowForm.value.MaSach,
          NgayHenTra: borrowForm.value.NgayHenTra,
          GhiChu: borrowForm.value.GhiChu
        }

        const response = await axios.post('/theodoimuonsach/register', requestData)
        
        if (response.data.success) {
          showMessage('Đăng ký mượn sách thành công! Vui lòng chờ thư viện phê duyệt.', 'success')
          closeBorrowModal()
        } else {
          showMessage(response.data.message || 'Có lỗi xảy ra khi đăng ký', 'error')
        }
      } catch (error) {
        console.error('Error submitting borrow registration:', error)
        showMessage(error.response?.data?.message || 'Có lỗi xảy ra khi đăng ký', 'error')
      } finally {
        submitting.value = false
      }
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
      
      // Close dropdowns when clicking outside
      document.addEventListener('click', (event) => {
        const target = event.target
        const isDropdownClick = target.closest('.dropdown')
        if (!isDropdownClick) {
          closeDropdowns()
        }
      })
    })

    return {
      searchQuery,
      topCategories,
      message,
      messageType,
      user,
      isAuthenticated,
      showUserDropdown,
      showCategoriesDropdown,
      showBorrowModal,
      submitting,
      availableBooks,
      borrowForm,
      borrowErrors,
      tomorrow,
      handleSearch,
      logout,
      handleLogout,
      clearMessage,
      handleLogoError,
      handleAvatarError,
      toggleUserDropdown,
      toggleCategoriesDropdown,
      closeDropdowns,
      showBorrowRegistrationModal,
      closeBorrowModal,
      submitBorrowRegistration
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

/* Dropdown animation */
.dropdown-menu {
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition: all 0.2s ease-in-out;
}

.dropdown-menu.show {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

/* Ensure dropdown is positioned correctly */
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  display: block;
  min-width: 10rem;
  padding: 0.5rem 0;
  margin: 0.125rem 0 0;
  font-size: 1rem;
  color: #212529;
  text-align: left;
  list-style: none;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 0.375rem;
}

.dropdown-menu-end {
  right: 0;
  left: auto;
}

/* Modal styles */
.modal {
  z-index: 1055;
}

.modal-backdrop {
  z-index: 1050;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal.show {
  display: block !important;
}

.modal-backdrop.show {
  opacity: 0.5;
}

/* Fix modal animation */
.modal.fade .modal-dialog {
  transition: transform 0.3s ease-out;
  transform: translate(0, -50px);
}

.modal.show .modal-dialog {
  transform: none;
}
</style>