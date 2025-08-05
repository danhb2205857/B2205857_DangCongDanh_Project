<template>
  <div class="categories-page">
    <!-- Page Header -->
    <div class="page-header mb-5">
      <div class="row">
        <div class="col-12">
          <h1 class="mb-4">
            <i class="fas fa-tags text-primary me-2"></i>
            Nhà xuất bản
          </h1>
          <p class="text-muted mb-4">Khám phá các nhà xuất bản và tìm hiểu về những cuốn sách họ phát hành</p>
        </div>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="search-filter-section mb-4">
      <div class="row">
        <div class="col-md-8">
          <div class="input-group">
            <span class="input-group-text">
              <i class="fas fa-search"></i>
            </span>
            <input 
              v-model="searchQuery" 
              @input="handleSearch"
              type="text" 
              class="form-control" 
              placeholder="Tìm kiếm nhà xuất bản..."
            >
          </div>
        </div>
        <div class="col-md-4">
          <select v-model="sortBy" @change="loadCategories" class="form-select">
            <option value="TenNhaXuatBan">Sắp xếp theo tên</option>
            <option value="createdAt">Mới nhất</option>
            <option value="bookCount">Số lượng sách</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <!-- Categories Grid -->
    <div v-else-if="categories.length > 0" class="categories-grid">
      <div class="row g-4">
        <div v-for="category in categories" :key="category.MaNhaXuatBan" class="col-md-6 col-lg-4">
          <div class="card h-100 shadow-sm border-0 category-card" @click="viewCategory(category.MaNhaXuatBan)">
            <div class="card-body d-flex flex-column">
              <div class="d-flex align-items-center mb-3">
                <div class="category-icon bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                  <i class="fas fa-building"></i>
                </div>
                <div class="flex-grow-1">
                  <h5 class="card-title mb-1">{{ category.TenNhaXuatBan }}</h5>
                  <small class="text-muted">
                    <i class="fas fa-map-marker-alt me-1"></i>
                    {{ category.DiaChi }}
                  </small>
                </div>
              </div>
              
              <div class="mb-3">
                <div class="row text-center">
                  <div class="col-6">
                    <div class="stat-mini">
                      <h6 class="text-primary mb-0">{{ category.SoSach || 0 }}</h6>
                      <small class="text-muted">Sách</small>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="stat-mini">
                      <h6 class="text-success mb-0">{{ category.MaNhaXuatBan }}</h6>
                      <small class="text-muted">Mã NXB</small>
                    </div>
                  </div>
                </div>
              </div>

              <div class="contact-info mb-3" v-if="category.DienThoai">
                <small class="text-muted">
                  <i class="fas fa-phone me-1"></i>
                  {{ category.DienThoai }}
                </small>
              </div>
              
              <div class="mt-auto">
                <button class="btn btn-outline-primary w-100">
                  <i class="fas fa-arrow-right me-2"></i>
                  Xem sách xuất bản
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="d-flex justify-content-center mt-5" v-if="pagination.totalPages > 1">
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
      <i class="fas fa-building fa-4x text-muted mb-4"></i>
      <h4 class="text-muted mb-3">Không tìm thấy nhà xuất bản nào</h4>
      <p class="text-muted mb-4">
        {{ searchQuery ? 'Thử tìm kiếm với từ khóa khác' : 'Chưa có nhà xuất bản nào được thêm vào hệ thống' }}
      </p>
      <button v-if="searchQuery" @click="clearSearch" class="btn btn-outline-primary">
        <i class="fas fa-times me-2"></i>
        Xóa bộ lọc
      </button>
    </div>

    <!-- Statistics -->
    <div class="stats-section mt-5">
      <div class="card bg-light border-0">
        <div class="card-body text-center py-4">
          <h4 class="mb-3">
            <i class="fas fa-chart-bar text-success me-2"></i>
            Thống kê nhà xuất bản
          </h4>
          <div class="row">
            <div class="col-md-4">
              <div class="stat-item">
                <h3 class="text-primary">{{ pagination.total }}</h3>
                <p class="text-muted mb-0">Tổng nhà xuất bản</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="stat-item">
                <h3 class="text-success">{{ totalBooks }}</h3>
                <p class="text-muted mb-0">Tổng sách xuất bản</p>
              </div>
            </div>
            <div class="col-md-4">
              <div class="stat-item">
                <h3 class="text-warning">{{ averageBooksPerPublisher }}</h3>
                <p class="text-muted mb-0">Trung bình sách/NXB</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/utils/axios'

export default {
  name: 'Categories',
  setup() {
    const router = useRouter()
    const categories = ref([])
    const loading = ref(false)
    const searchQuery = ref('')
    const sortBy = ref('TenNhaXuatBan')
    const currentPage = ref(1)
    const pagination = ref({
      total: 0,
      totalPages: 0,
      currentPage: 1,
      limit: 12,
      hasNextPage: false,
      hasPrevPage: false
    })

    let searchTimeout = null

    const loadCategories = async (page = 1) => {
      loading.value = true
      try {
        const params = {
          page,
          limit: pagination.value.limit,
          sortBy: sortBy.value,
          sortOrder: 'asc'
        }

        if (searchQuery.value.trim()) {
          params.search = searchQuery.value.trim()
        }

        const response = await axios.get('/api/nhaxuatban', { params })
        categories.value = response.data.data.nhaxuatban || []
        pagination.value = response.data.data.pagination || pagination.value
      } catch (error) {
        console.error('Error loading categories:', error)
        categories.value = []
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
        loadCategories(1)
      }, 500)
    }

    const clearSearch = () => {
      searchQuery.value = ''
      currentPage.value = 1
      loadCategories(1)
    }

    const changePage = (page) => {
      if (page >= 1 && page <= pagination.value.totalPages) {
        currentPage.value = page
        loadCategories(page)
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

    const viewCategory = (categoryId) => {
      router.push({ name: 'CategoryBooks', params: { id: categoryId } })
    }

    const totalBooks = computed(() => {
      return categories.value.reduce((sum, cat) => sum + (cat.SoSach || 0), 0)
    })

    const averageBooksPerPublisher = computed(() => {
      if (categories.value.length === 0) return 0
      return Math.round(totalBooks.value / categories.value.length)
    })

    onMounted(() => {
      loadCategories()
    })

    return {
      categories,
      loading,
      searchQuery,
      sortBy,
      pagination,
      totalBooks,
      averageBooksPerPublisher,
      loadCategories,
      handleSearch,
      clearSearch,
      changePage,
      getPageNumbers,
      viewCategory
    }
  }
}
</script>

<style>
@import '@/assets/styles/pages/categories.css';
</style>