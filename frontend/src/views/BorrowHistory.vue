<template>
  <div class="borrow-history-page">
    <div class="container py-4">
      <div class="row">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h2 class="mb-0">
              <i class="fas fa-history me-2 text-primary"></i>
              Lịch sử mượn sách
            </h2>
            <div class="d-flex align-items-center gap-2">
              <select v-model="filterStatus" class="form-select form-select-sm" style="width: auto;">
                <option value="">Tất cả</option>
                <option value="returned">Đã trả</option>
                <option value="borrowing">Đang mượn</option>
              </select>
              <button class="btn btn-outline-primary btn-sm" @click="loadBorrowHistory">
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
            <p class="mt-2 text-muted">Đang tải lịch sử...</p>
          </div>

          <!-- Empty State -->
          <div v-else-if="filteredHistory.length === 0" class="text-center py-5">
            <div class="mb-4">
              <i class="fas fa-history fa-4x text-muted"></i>
            </div>
            <h4 class="text-muted mb-3">Chưa có lịch sử mượn sách</h4>
            <p class="text-muted mb-4">Bạn chưa có lịch sử mượn sách nào.</p>
            <router-link to="/books" class="btn btn-primary">
              <i class="fas fa-search me-2"></i>
              Khám phá sách
            </router-link>
          </div>

          <!-- History List -->
          <div v-else>
            <!-- Statistics -->
            <div class="row mb-4">
              <div class="col-md-3">
                <div class="card border-0 bg-light">
                  <div class="card-body text-center">
                    <i class="fas fa-book text-primary fa-2x mb-2"></i>
                    <h5 class="mb-1">{{ borrowHistory.length }}</h5>
                    <small class="text-muted">Tổng lượt mượn</small>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card border-0 bg-light">
                  <div class="card-body text-center">
                    <i class="fas fa-check-circle text-success fa-2x mb-2"></i>
                    <h5 class="mb-1">{{ returnedCount }}</h5>
                    <small class="text-muted">Đã trả</small>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card border-0 bg-light">
                  <div class="card-body text-center">
                    <i class="fas fa-clock text-warning fa-2x mb-2"></i>
                    <h5 class="mb-1">{{ borrowingCount }}</h5>
                    <small class="text-muted">Đang mượn</small>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <div class="card border-0 bg-light">
                  <div class="card-body text-center">
                    <i class="fas fa-exclamation-triangle text-danger fa-2x mb-2"></i>
                    <h5 class="mb-1">{{ overdueCount }}</h5>
                    <small class="text-muted">Trả trễ</small>
                  </div>
                </div>
              </div>
            </div>

            <!-- History Table -->
            <div class="card border-0 shadow-sm">
              <div class="card-body p-0">
                <div class="table-responsive">
                  <table class="table table-hover mb-0">
                    <thead class="table-light">
                      <tr>
                        <th>Sách</th>
                        <th>Ngày mượn</th>
                        <th>Hạn trả</th>
                        <th>Ngày trả</th>
                        <th>Trạng thái</th>
                        <th>Ghi chú</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="record in paginatedHistory" :key="record._id">
                        <td>
                          <div class="d-flex align-items-center">
                            <img 
                              :src="record.AnhBia || '/images/book-placeholder.jpg'" 
                              :alt="record.TenSach"
                              class="book-thumb me-3"
                              @error="handleImageError"
                            >
                            <div>
                              <div class="fw-medium">{{ record.TenSach }}</div>
                              <small class="text-muted">{{ record.TacGia }}</small>
                            </div>
                          </div>
                        </td>
                        <td>{{ formatDate(record.NgayMuon) }}</td>
                        <td>
                          <span :class="getDueDateClass(record.NgayHenTra, record.NgayTra)">
                            {{ formatDate(record.NgayHenTra) }}
                          </span>
                        </td>
                        <td>{{ record.NgayTra ? formatDate(record.NgayTra) : '-' }}</td>
                        <td>
                          <span class="badge" :class="getStatusBadgeClass(record)">
                            {{ getStatusText(record) }}
                          </span>
                        </td>
                        <td>
                          <small class="text-muted">{{ getNote(record) }}</small>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <!-- Pagination -->
            <nav v-if="totalPages > 1" class="mt-4">
              <ul class="pagination justify-content-center">
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="currentPage = 1" :disabled="currentPage === 1">
                    <i class="fas fa-angle-double-left"></i>
                  </button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === 1 }">
                  <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                    <i class="fas fa-angle-left"></i>
                  </button>
                </li>
                <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === currentPage }">
                  <button class="page-link" @click="currentPage = page">{{ page }}</button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                    <i class="fas fa-angle-right"></i>
                  </button>
                </li>
                <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                  <button class="page-link" @click="currentPage = totalPages" :disabled="currentPage === totalPages">
                    <i class="fas fa-angle-double-right"></i>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useAuth } from '@/composables/useAuth'
import axios from '@/utils/axios'

export default {
  name: 'BorrowHistory',
  setup() {
    const { user } = useAuth()
    
    const borrowHistory = ref([])
    const loading = ref(false)
    const filterStatus = ref('')
    const currentPage = ref(1)
    const itemsPerPage = 10
    const totalItems = ref(0)
    const apiTotalPages = ref(1)

    // Computed properties
    const filteredHistory = computed(() => {
      return borrowHistory.value
    })

    const paginatedHistory = computed(() => {
      return borrowHistory.value
    })

    const totalPages = computed(() => {
      return apiTotalPages.value
    })

    const visiblePages = computed(() => {
      const pages = []
      const start = Math.max(1, currentPage.value - 2)
      const end = Math.min(totalPages.value, currentPage.value + 2)
      
      for (let i = start; i <= end; i++) {
        pages.push(i)
      }
      
      return pages
    })

    const returnedCount = computed(() => {
      return borrowHistory.value.filter(record => record.NgayTra).length
    })

    const borrowingCount = computed(() => {
      return borrowHistory.value.filter(record => !record.NgayTra).length
    })

    const overdueCount = computed(() => {
      return borrowHistory.value.filter(record => {
        if (record.NgayTra) {
          return new Date(record.NgayTra) > new Date(record.NgayHenTra)
        }
        return new Date() > new Date(record.NgayHenTra)
      }).length
    })

    // Methods
    const loadBorrowHistory = async () => {
      loading.value = true
      try {
        const params = {
          page: currentPage.value,
          limit: itemsPerPage
        }
        
        if (filterStatus.value) {
          params.status = filterStatus.value
        }
        
        const response = await axios.get('/docgia/borrow-history', { params })
        
        if (response.data.success) {
          borrowHistory.value = response.data.data.history || []
          // Update pagination info from API
          if (response.data.data.pagination) {
            totalItems.value = response.data.data.pagination.totalItems
            apiTotalPages.value = response.data.data.pagination.totalPages
          }
        } else {
          console.error('Failed to load borrow history')
        }
      } catch (error) {
        console.error('Error loading borrow history:', error)
        if (error.response?.status === 401) {
          // Handle authentication error
          console.error('Authentication required')
        }
      } finally {
        loading.value = false
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('vi-VN')
    }

    const getDueDateClass = (dueDate, returnDate) => {
      if (returnDate) {
        return new Date(returnDate) > new Date(dueDate) ? 'text-danger' : 'text-success'
      }
      return new Date() > new Date(dueDate) ? 'text-danger' : 'text-muted'
    }

    const getStatusBadgeClass = (record) => {
      if (record.NgayTra) {
        return new Date(record.NgayTra) > new Date(record.NgayHenTra) ? 'bg-warning' : 'bg-success'
      }
      return new Date() > new Date(record.NgayHenTra) ? 'bg-danger' : 'bg-primary'
    }

    const getStatusText = (record) => {
      if (record.NgayTra) {
        return new Date(record.NgayTra) > new Date(record.NgayHenTra) ? 'Trả trễ' : 'Đã trả'
      }
      return new Date() > new Date(record.NgayHenTra) ? 'Quá hạn' : 'Đang mượn'
    }

    const getNote = (record) => {
      if (record.NgayTra) {
        const dueDate = new Date(record.NgayHenTra)
        const returnDate = new Date(record.NgayTra)
        const diffTime = returnDate - dueDate
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays > 0) {
          return `Trả trễ ${diffDays} ngày`
        } else if (diffDays < 0) {
          return `Trả sớm ${Math.abs(diffDays)} ngày`
        } else {
          return 'Trả đúng hạn'
        }
      } else {
        const dueDate = new Date(record.NgayHenTra)
        const today = new Date()
        const diffTime = dueDate - today
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        
        if (diffDays < 0) {
          return `Quá hạn ${Math.abs(diffDays)} ngày`
        } else if (diffDays <= 3) {
          return `Còn ${diffDays} ngày`
        } else {
          return 'Bình thường'
        }
      }
    }

    const handleImageError = (event) => {
      event.target.src = '/images/book-placeholder.jpg'
    }

    // Watch for filter changes
    watch(filterStatus, () => {
      currentPage.value = 1
      loadBorrowHistory()
      
    })
    
    watch(currentPage, () => {
      loadBorrowHistory()
    })

    // Load data on mount
    onMounted(() => {
      loadBorrowHistory()
    })

    return {
      user,
      borrowHistory,
      loading,
      filterStatus,
      currentPage,
      totalItems,
      filteredHistory,
      paginatedHistory,
      totalPages,
      visiblePages,
      returnedCount,
      borrowingCount,
      overdueCount,
      loadBorrowHistory,
      formatDate,
      getDueDateClass,
      getStatusBadgeClass,
      getStatusText,
      getNote,
      handleImageError
    }
  }
}
</script>

<style scoped>
.borrow-history-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-top: 80px;
}

.book-thumb {
  width: 40px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
  font-size: 0.875rem;
}

.table td {
  vertical-align: middle;
  font-size: 0.875rem;
}

.pagination .page-link {
  border: none;
  color: #6c757d;
  padding: 0.5rem 0.75rem;
}

.pagination .page-item.active .page-link {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.pagination .page-link:hover {
  background-color: #e9ecef;
  color: #0d6efd;
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.8rem;
  }
  
  .book-thumb {
    width: 30px;
    height: 40px;
  }
}
</style>