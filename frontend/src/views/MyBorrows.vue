<template>
  <div class="my-borrows-page">
    <div class="container py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">
              <i class="fas fa-book me-2 text-primary"></i>
              Sách đang mượn
            </h2>
            <div class="d-flex align-items-center">
              <span class="badge bg-primary me-2">{{ borrowedBooks.length }} cuốn</span>
              <button class="btn btn-outline-primary btn-sm" @click="loadBorrowedBooks">
                <i class="fas fa-sync-alt me-1"></i>
                Làm mới
              </button>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="loading" class="text-center py-5">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Đang tải...</span>
            </div>
            <p class="mt-2 text-muted">Đang tải danh sách sách...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="borrowedBooks.length === 0" class="text-center py-5">
            <div class="mb-4">
              <i class="fas fa-book-open fa-4x text-muted"></i>
            </div>
            <h4 class="text-muted mb-3">Chưa có sách đang mượn</h4>
            <p class="text-muted mb-4">Bạn chưa mượn cuốn sách nào. Hãy khám phá thư viện và mượn những cuốn sách yêu thích!</p>
            <router-link to="/books" class="btn btn-primary">
              <i class="fas fa-search me-2"></i>
              Khám phá sách
            </router-link>
          </div>

          <!-- Books List -->
          <div v-else>
            <!-- Summary Cards -->
            <div class="row mb-4">
              <div class="col-md-4">
                <div class="card border-0 bg-light">
                  <div class="card-body text-center">
                    <i class="fas fa-book text-primary fa-2x mb-2"></i>
                    <h5 class="mb-1">{{ borrowedBooks.length }}</h5>
                    <small class="text-muted">Tổng số sách</small>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card border-0 bg-light">
                  <div class="card-body text-center">
                    <i class="fas fa-clock text-warning fa-2x mb-2"></i>
                    <h5 class="mb-1">{{ nearDueBooks.length }}</h5>
                    <small class="text-muted">Sắp hết hạn</small>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div class="card border-0 bg-light">
                  <div class="card-body text-center">
                    <i class="fas fa-exclamation-triangle text-danger fa-2x mb-2"></i>
                    <h5 class="mb-1">{{ overdueBooks.length }}</h5>
                    <small class="text-muted">Quá hạn</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- Books Grid -->
            <div class="row">
              <div v-for="book in borrowedBooks" :key="book._id" class="col-lg-6 col-xl-4 mb-4">
                <div class="card h-100 shadow-sm border-0">
                  <div class="card-body">
                    <div class="d-flex">
                      <div class="book-cover me-3">
                        <img 
                          :src="book.AnhBia || '/images/book-placeholder.jpg'" 
                          :alt="book.TenSach"
                          class="img-fluid rounded"
                          @error="handleImageError"
                        >
                      </div>
                      <div class="flex-grow-1">
                        <h6 class="card-title mb-2">{{ book.TenSach }}</h6>
                        <p class="text-muted small mb-2">
                          <i class="fas fa-user me-1"></i>
                          {{ book.TacGia }}
                        </p>
                        <p class="text-muted small mb-2">
                          <i class="fas fa-building me-1"></i>
                          {{ book.TenNhaXuatBan }}
                        </p>
                        
                        <!-- Borrow Info -->
                        <div class="mt-3">
                          <div class="d-flex justify-content-between align-items-center mb-2">
                            <small class="text-muted">Ngày mượn:</small>
                            <small class="fw-medium">{{ formatDate(book.NgayMuon) }}</small>
                          </div>
                          <div class="d-flex justify-content-between align-items-center mb-2">
                            <small class="text-muted">Hạn trả:</small>
                            <small class="fw-medium" :class="getDueDateClass(book.NgayHenTra)">
                              {{ formatDate(book.NgayHenTra) }}
                            </small>
                          </div>
                          <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">Trạng thái:</small>
                            <span class="badge" :class="getStatusBadgeClass(book.NgayHenTra)">
                              {{ getStatusText(book.NgayHenTra) }}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <!-- Action Footer -->
                  <div class="card-footer bg-transparent border-0 pt-0">
                    <div class="d-flex gap-2">
                      <button 
                        class="btn btn-outline-primary btn-sm flex-fill"
                        @click="requestRenewal(book)"
                        :disabled="isOverdue(book.NgayHenTra)"
                      >
                        <i class="fas fa-redo me-1"></i>
                        Gia hạn
                      </button>
                      <button 
                        class="btn btn-outline-success btn-sm flex-fill"
                        @click="requestReturn(book)"
                      >
                        <i class="fas fa-check me-1"></i>
                        Trả sách
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" class="alert-container">
      <div class="alert alert-dismissible fade show"
        :class="messageType === 'success' ? 'alert-success' : 'alert-danger'" role="alert">
        <i :class="messageType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'" class="me-2"></i>
        {{ message }}
        <button type="button" class="btn-close" @click="clearMessage"></button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '@/composables/useAuth'
import axios from '@/utils/axios'

export default {
  name: 'MyBorrows',
  setup() {
    const { user } = useAuth()
    
    const borrowedBooks = ref([])
    const loading = ref(false)
    const message = ref('')
    const messageType = ref('success')

    // Computed properties
    const overdueBooks = computed(() => {
      return borrowedBooks.value.filter(book => isOverdue(book.NgayHenTra))
    })

    const nearDueBooks = computed(() => {
      return borrowedBooks.value.filter(book => {
        const dueDate = new Date(book.NgayHenTra)
        const today = new Date()
        const diffTime = dueDate - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays <= 3 && diffDays > 0
      })
    })

    // Methods
    const loadBorrowedBooks = async () => {
      loading.value = true
      try {
        const response = await axios.get('/docgia/my-borrows')
        
        if (response.data.success) {
          borrowedBooks.value = response.data.data || []
        } else {
          showMessage('Không thể tải danh sách sách đang mượn', 'error')
        }
      } catch (error) {
        console.error('Error loading borrowed books:', error)
        if (error.response?.status === 401) {
          showMessage('Phiên đăng nhập đã hết hạn', 'error')
        } else {
          showMessage('Không thể tải danh sách sách đang mượn', 'error')
        }
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('vi-VN')
    }

    const isOverdue = (dateString) => {
      if (!dateString) return false
      return new Date(dateString) < new Date()
    }

    const getDueDateClass = (dateString) => {
      if (isOverdue(dateString)) return 'text-danger'
      
      const dueDate = new Date(dateString)
      const today = new Date()
      const diffTime = dueDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 3) return 'text-warning'
      return 'text-success'
    }

    const getStatusBadgeClass = (dateString) => {
      if (isOverdue(dateString)) return 'bg-danger'
      
      const dueDate = new Date(dateString)
      const today = new Date()
      const diffTime = dueDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 3) return 'bg-warning'
      return 'bg-success'
    }

    const getStatusText = (dateString) => {
      if (isOverdue(dateString)) return 'Quá hạn'
      
      const dueDate = new Date(dateString)
      const today = new Date()
      const diffTime = dueDate - today
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      
      if (diffDays <= 3) return 'Sắp hết hạn'
      return 'Bình thường'
    }

    const requestRenewal = async (book) => {
      try {
        // TODO: Implement renewal API when available
        showMessage(`Yêu cầu gia hạn cho "${book.TenSach}" đã được gửi. Vui lòng liên hệ thư viện để xác nhận.`, 'success')
      } catch (error) {
        showMessage('Không thể gửi yêu cầu gia hạn', 'error')
      }
    }

    const requestReturn = async (book) => {
      try {
        // TODO: Implement return API when available
        showMessage(`Yêu cầu trả sách "${book.TenSach}" đã được ghi nhận. Vui lòng mang sách đến thư viện.`, 'success')
      } catch (error) {
        showMessage('Không thể gửi yêu cầu trả sách', 'error')
      }
    }

    const handleImageError = (event) => {
      event.target.src = '/images/book-placeholder.jpg'
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

    // Load data on mount
    onMounted(() => {
      loadBorrowedBooks()
    })

    return {
      user,
      borrowedBooks,
      loading,
      message,
      messageType,
      overdueBooks,
      nearDueBooks,
      loadBorrowedBooks,
      formatDate,
      isOverdue,
      getDueDateClass,
      getStatusBadgeClass,
      getStatusText,
      requestRenewal,
      requestReturn,
      handleImageError,
      clearMessage
    }
  }
}
</script>

<style scoped>
.my-borrows-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-top: 80px;
}

.book-cover {
  width: 60px;
  flex-shrink: 0;
}

.book-cover img {
  width: 60px;
  height: 80px;
  object-fit: cover;
}

.card {
  transition: transform 0.2s ease-in-out;
}

.card:hover {
  transform: translateY(-2px);
}

.alert-container {
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 1050;
  min-width: 300px;
  max-width: 500px;
}

@media (max-width: 768px) {
  .alert-container {
    right: 10px;
    left: 10px;
    min-width: auto;
  }
  
  .book-cover {
    width: 50px;
  }
  
  .book-cover img {
    width: 50px;
    height: 65px;
  }
}
</style>