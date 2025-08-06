<template>
  <div class="books-list">
    <!-- Page Header (improved) -->
    <div class="page-header bg-primary text-white py-5 mb-5 rounded-3 shadow-sm">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="display-4 fw-bold mb-3">
              <i class="fas fa-book fa-lg me-2"></i>
              {{ pageTitle }}
            </h1>
            <p class="lead mb-0 opacity-75">{{ pageDescription }}</p>
          </div>
          <div class="col-md-4 text-center text-md-end mt-4 mt-md-0">
            <div class="d-inline-flex gap-2 justify-content-md-end">
              <button 
                class="btn btn-light btn-lg px-4"
                :class="{ active: viewMode === 'grid' }"
                @click="viewMode = 'grid'"
                title="Xem dạng lưới"
              >
                <i class="fas fa-th"></i>
              </button>
              <button 
                class="btn btn-light btn-lg px-4"
                :class="{ active: viewMode === 'list' }"
                @click="viewMode = 'list'"
                title="Xem dạng danh sách"
              >
                <i class="fas fa-list"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Filters and Search -->
    <div class="filters-section mb-4">
      <div class="card border-0 shadow-sm">
        <div class="card-body">
          <div class="row g-3">
            <div class="col-md-4">
              <div class="input-group">
                <span class="input-group-text">
                  <i class="fas fa-search"></i>
                </span>
                <input 
                  v-model="searchQuery" 
                  @input="handleSearch"
                  type="text" 
                  class="form-control" 
                  placeholder="Tìm kiếm sách..."
                >
              </div>
            </div>
            <div class="col-md-2">
              <select v-model="sortBy" @change="loadBooks" class="form-select">
                <option value="TenSach">Tên sách</option>
                <option value="NguonGoc">Tác giả</option>
                <option value="NamXuatBan">Năm xuất bản</option>
                <option value="DonGia">Giá</option>
                <option value="createdAt">Mới nhất</option>
              </select>
            </div>
            <div class="col-md-2">
              <select v-model="sortOrder" @change="loadBooks" class="form-select">
                <option value="asc">Tăng dần</option>
                <option value="desc">Giảm dần</option>
              </select>
            </div>
            <div class="col-md-2">
              <select v-model="filterAvailable" @change="loadBooks" class="form-select">
                <option value="">Tất cả</option>
                <option value="available">Còn hàng</option>
                <option value="unavailable">Hết hàng</option>
              </select>
            </div>
            <div class="col-md-2">
              <button @click="clearFilters" class="btn btn-outline-secondary w-100">
                <i class="fas fa-times me-1"></i>
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <!-- Books Grid/List -->
    <div v-else-if="books.length > 0">
      <!-- Grid View -->
      <div v-if="viewMode === 'grid'" class="books-grid">
        <div class="row g-4">
          <div v-for="book in books" :key="book.MaSach" class="col-6 col-sm-4 col-md-3 col-lg-2">
            <div class="card h-100 shadow-sm border-0 book-card" @click="viewBook(book.MaSach)">
              <div class="position-relative">
                <img 
                  src="/images/dacnhantam.jpg" 
                  class="card-img-top book-thumb"
                  :alt="book.TenSach"
                  @error="handleImageError"
                >
                <div class="position-absolute top-0 end-0 m-2">
                  <span 
                    class="badge"
                    :class="book.SoQuyen > 0 ? 'bg-success' : 'bg-danger'"
                  >
                    {{ book.SoQuyen > 0 ? 'Còn hàng' : 'Hết hàng' }}
                  </span>
                </div>
                <div class="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-2">
                  <small class="text-xs">
                    <i class="fas fa-book me-1"></i>
                    {{ book.SoQuyen }} quyển
                  </small>
                </div>
              </div>
              <div class="card-body p-3">
                <h6 class="card-title text-dark fw-semibold mb-2 text-truncate-2">
                  {{ book.TenSach }}
                </h6>
                <p class="card-text text-muted small mb-2">
                  <i class="fas fa-user me-1"></i>
                  {{ book.NguonGoc }}
                </p>
                <p class="card-text text-muted small mb-2">
                  <i class="fas fa-building me-1"></i>
                  {{ book.NhaXuatBan }}
                </p>
                <p class="card-text text-primary small mb-0">
                  <strong>{{ formatPrice(book.DonGia) }}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- List View -->
      <div v-else class="books-list-view">
        <div class="card border-0 shadow-sm">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-light">
                <tr>
                  <th>Sách</th>
                  <th>Tác giả</th>
                  <th>Nhà xuất bản</th>
                  <th>Năm XB</th>
                  <th>Giá</th>
                  <th>Số lượng</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="book in books" :key="book.MaSach" class="book-row">
                  <td>
                    <div class="d-flex align-items-center">
                      <img 
                        src="/images/dacnhantam.jpg" 
                        class="book-thumb-small me-3"
                        :alt="book.TenSach"
                        @error="handleImageError"
                      >
                      <div>
                        <h6 class="mb-1">{{ book.TenSach }}</h6>
                        <small class="text-muted">{{ book.MaSach }}</small>
                      </div>
                    </div>
                  </td>
                  <td>{{ book.NguonGoc }}</td>
                  <td>{{ book.NhaXuatBan }}</td>
                  <td>{{ book.NamXuatBan }}</td>
                  <td>{{ formatPrice(book.DonGia) }}</td>
                  <td>
                    <span class="badge bg-light text-dark">{{ book.SoQuyen }}</span>
                  </td>
                  <td>
                    <span 
                      class="badge"
                      :class="book.SoQuyen > 0 ? 'bg-success' : 'bg-danger'"
                    >
                      {{ book.SoQuyen > 0 ? 'Còn hàng' : 'Hết hàng' }}
                    </span>
                  </td>
                  <td>
                    <button 
                      @click="viewBook(book.MaSach)" 
                      class="btn btn-sm btn-outline-primary"
                      title="Xem chi tiết"
                    >
                      <i class="fas fa-eye"></i>
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-center mt-4" v-if="pagination.totalPages > 1">
        <nav>
          <ul class="pagination">
            <li class="page-item" :class="{ disabled: !pagination.hasPrevPage }">
              <button 
                class="page-link" 
                @click="changePage(pagination.currentPage - 1)"
                :disabled="!pagination.hasPrevPage"
              >
                <i class="fas fa-chevron-left"></i>
              </button>
            </li>
            
            <li 
              v-for="page in getPageNumbers()" 
              :key="page" 
              class="page-item" 
              :class="{ active: page === pagination.currentPage }"
            >
              <button class="page-link" @click="changePage(page)">{{ page }}</button>
            </li>
            
            <li class="page-item" :class="{ disabled: !pagination.hasNextPage }">
              <button 
                class="page-link" 
                @click="changePage(pagination.currentPage + 1)"
                :disabled="!pagination.hasNextPage"
              >
                <i class="fas fa-chevron-right"></i>
              </button>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state text-center py-5">
      <i class="fas fa-book fa-4x text-muted mb-4"></i>
      <h4 class="text-muted mb-3">Không tìm thấy sách nào</h4>
      <p class="text-muted mb-4">
        {{ searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có sách nào trong danh mục này' }}
      </p>
      <button v-if="searchQuery" @click="clearFilters" class="btn btn-outline-primary">
        <i class="fas fa-times me-2"></i>
        Xóa bộ lọc
      </button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/utils/axios'

export default {
  name: 'BooksList',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const books = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    const sortBy = ref('TenSach')
    const sortOrder = ref('asc')
    const filterAvailable = ref('')
    const viewMode = ref('grid')
    const currentPage = ref(1)
    
    const pagination = ref({
      total: 0,
      totalPages: 0,
      currentPage: 1,
      limit: 20,
      hasNextPage: false,
      hasPrevPage: false
    })

    let searchTimeout = null

    const pageTitle = computed(() => {
      if (route.params.id) {
        return `Sách của nhà xuất bản`
      }
      return 'Tất cả sách'
    })

    const pageDescription = computed(() => {
      if (route.params.id) {
        return `Khám phá các đầu sách được xuất bản bởi nhà xuất bản này`
      }
      return 'Khám phá kho tàng sách phong phú và đa dạng'
    })

    const loadBooks = async (page = 1) => {
      loading.value = true
      try {
        const params = {
          page,
          limit: pagination.value.limit,
          sortBy: sortBy.value,
          sortOrder: sortOrder.value
        }

        if (searchQuery.value.trim()) {
          params.search = searchQuery.value.trim()
        }

        if (route.params.id) {
          params.MaNhaXuatBan = route.params.id
        }

        if (filterAvailable.value === 'available') {
          params.available = true
        } else if (filterAvailable.value === 'unavailable') {
          params.available = false
        }

        const response = await axios.get('/sach', { params })
        books.value = response.data.data || []
        pagination.value = response.data.pagination || pagination.value
      } catch (error) {
        console.error('Error loading books:', error)
        books.value = []
      } finally {
        loading.value = false
      }
    }

    const handleSearch = () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout)
      }
      searchTimeout = setTimeout(() => {
        currentPage.value = 1
        loadBooks(1)
      }, 500)
    }

    const clearFilters = () => {
      searchQuery.value = ''
      sortBy.value = 'TenSach'
      sortOrder.value = 'asc'
      filterAvailable.value = ''
      currentPage.value = 1
      loadBooks(1)
    }

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.value.totalPages) {
        currentPage.value = page
        loadBooks(page)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    }

    const getPageNumbers = () => {
      const pages = []
      const total = pagination.value.totalPages
      const current = pagination.value.currentPage
      
      if (total <= 7) {
        for (let i = 1; i <= total; i++) {
          pages.push(i)
        }
      } else {
        if (current <= 4) {
          for (let i = 1; i <= 5; i++) pages.push(i)
          pages.push('...')
          pages.push(total)
        } else if (current >= total - 3) {
          pages.push(1)
          pages.push('...')
          for (let i = total - 4; i <= total; i++) pages.push(i)
        } else {
          pages.push(1)
          pages.push('...')
          for (let i = current - 1; i <= current + 1; i++) pages.push(i)
          pages.push('...')
          pages.push(total)
        }
      }
      
      return pages
    }

    const viewBook = (bookId) => {
      router.push({ name: 'BookDetail', params: { id: bookId } })
    }

    const getBookImage = (book) => {
      // In a real app, this would come from book.image or similar field
      return book.image || '/images/book-placeholder.svg'
    }

    const handleImageError = (event) => {
      // Fallback to placeholder if image fails to load
      event.target.src = '/images/book-placeholder.svg'
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price)
    }

    // Watch route changes
    watch(() => route.params.id, () => {
      currentPage.value = 1
      loadBooks(1)
    })

    onMounted(() => {
      // Get search query from URL if exists
      if (route.query.search) {
        searchQuery.value = route.query.search
      }
      loadBooks()
    })

    return {
      books,
      loading,
      searchQuery,
      sortBy,
      sortOrder,
      filterAvailable,
      viewMode,
      pagination,
      pageTitle,
      pageDescription,
      loadBooks,
      handleSearch,
      clearFilters,
      changePage,
      getPageNumbers,
      viewBook,
      getBookImage,
      handleImageError,
      formatPrice
    }
  }
}
</script>

<style scoped>
.book-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
}

.book-thumb {
  height: 200px;
  object-fit: cover;
}

.book-thumb-small {
  width: 50px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
}

.book-row {
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.book-row:hover {
  background-color: #f8f9fa;
}

.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.filters-section .btn.active {
  background-color: #0d6efd;
  color: white;
  border-color: #0d6efd;
}

.page-link {
  border: none;
  color: #6c757d;
}

.page-link:hover {
  background-color: #e9ecef;
  color: #495057;
}

.page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
}

@media (max-width: 768px) {
  .book-thumb {
    height: 150px;
  }
  
  .books-grid .col-6 {
    flex: 0 0 50%;
    max-width: 50%;
  }
}
</style>