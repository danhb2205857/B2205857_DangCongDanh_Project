<template>
  <div class="book-detail">
    <!-- Loading -->
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Đang tải...</span>
      </div>
    </div>

    <!-- Book Detail Content -->
    <div v-else-if="book" class="row">
      <!-- Book Image -->
      <div class="col-md-4 mb-4">
        <div class="book-image-container">
          <img 
            src="/images/dacnhantam.jpg" 
            :alt="book.TenSach"
            class="img-fluid book-detail-image"
            @error="handleImageError"
          >
          <div class="book-status mt-3">
            <span 
              class="badge fs-6 px-3 py-2"
              :class="book.SoQuyen > 0 ? 'bg-success' : 'bg-danger'"
            >
              {{ book.SoQuyen > 0 ? 'Còn hàng' : 'Hết hàng' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Book Info -->
      <div class="col-md-8">
        <div class="book-info">
          <h1 class="book-title mb-3">{{ book.TenSach }}</h1>
          
          <div class="book-meta mb-4">
            <div class="row g-3">
              <div class="col-sm-6">
                <div class="meta-item">
                  <strong>Mã sách:</strong>
                  <span class="ms-2">{{ book.MaSach }}</span>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="meta-item">
                  <strong>Tác giả:</strong>
                  <span class="ms-2">{{ book.NguonGoc }}</span>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="meta-item">
                  <strong>Nhà xuất bản:</strong>
                  <span class="ms-2">{{ book.NhaXuatBan }}</span>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="meta-item">
                  <strong>Năm xuất bản:</strong>
                  <span class="ms-2">{{ book.NamXuatBan }}</span>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="meta-item">
                  <strong>Số lượng:</strong>
                  <span class="ms-2">{{ book.SoQuyen }} quyển</span>
                </div>
              </div>
              <div class="col-sm-6">
                <div class="meta-item">
                  <strong>Giá:</strong>
                  <span class="ms-2 text-primary fw-bold">{{ formatPrice(book.DonGia) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="book-actions mb-4">
            <button 
              v-if="book.SoQuyen > 0"
              class="btn btn-primary btn-lg me-3"
              @click="borrowBook"
            >
              <i class="fas fa-book me-2"></i>
              Mượn sách
            </button>
            <button 
              v-else
              class="btn btn-secondary btn-lg me-3" 
              disabled
            >
              <i class="fas fa-times me-2"></i>
              Hết hàng
            </button>
            
            <button class="btn btn-outline-primary btn-lg">
              <i class="fas fa-heart me-2"></i>
              Yêu thích
            </button>
          </div>

          <!-- Book Description -->
          <div class="book-description">
            <h5>Mô tả</h5>
            <p class="text-muted">
              Đây là một cuốn sách hay và bổ ích. Nội dung phong phú, 
              cung cấp kiến thức chuyên sâu về chủ đề được đề cập.
              Phù hợp cho độc giả muốn tìm hiểu thêm về lĩnh vực này.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Not Found -->
    <div v-else class="text-center py-5">
      <i class="fas fa-book fa-4x text-muted mb-4"></i>
      <h4 class="text-muted mb-3">Không tìm thấy sách</h4>
      <p class="text-muted mb-4">Sách bạn đang tìm không tồn tại hoặc đã bị xóa</p>
      <router-link to="/books" class="btn btn-primary">
        <i class="fas fa-arrow-left me-2"></i>
        Quay lại danh sách
      </router-link>
    </div>

    <!-- Related Books -->
    <div v-if="book && relatedBooks.length > 0" class="related-books mt-5">
      <h4 class="mb-4">Sách liên quan</h4>
      <div class="row g-4">
        <div v-for="relatedBook in relatedBooks" :key="relatedBook.MaSach" class="col-6 col-sm-4 col-md-3 col-lg-2">
          <div class="card h-100 shadow-sm border-0 book-card" @click="viewBook(relatedBook.MaSach)">
            <img 
              :src="getBookImage(relatedBook)" 
              class="card-img-top book-thumb"
              :alt="relatedBook.TenSach"
              @error="handleImageError"
            >
            <div class="card-body p-2">
              <h6 class="card-title text-dark fw-semibold mb-1 text-truncate">
                {{ relatedBook.TenSach }}
              </h6>
              <p class="card-text text-muted small mb-0">{{ relatedBook.NguonGoc }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from '@/utils/axios'

export default {
  name: 'BookDetail',
  setup() {
    const route = useRoute()
    const router = useRouter()
    
    const book = ref(null)
    const relatedBooks = ref([])
    const loading = ref(false)

    const loadBook = async () => {
      loading.value = true
      try {
        const response = await axios.get(`/sach/${route.params.id}`)
        book.value = response.data.data
        
        // Load related books (same publisher)
        if (book.value) {
          loadRelatedBooks()
        }
      } catch (error) {
        console.error('Error loading book:', error)
        book.value = null
      } finally {
        loading.value = false
      }
    }

    const loadRelatedBooks = async () => {
      try {
        const response = await axios.get('/sach', {
          params: {
            MaNhaXuatBan: book.value.MaNhaXuatBan,
            limit: 6
          }
        })
        // Filter out current book
        relatedBooks.value = (response.data.data.sach || [])
          .filter(b => b.MaSach !== book.value.MaSach)
          .slice(0, 5)
      } catch (error) {
        console.error('Error loading related books:', error)
      }
    }

    const borrowBook = () => {
      // In a real app, this would open a borrow modal or redirect to borrow page
      alert('Tính năng mượn sách sẽ được cập nhật sớm!')
    }

    const viewBook = (bookId) => {
      router.push({ name: 'BookDetail', params: { id: bookId } })
    }

    const getBookImage = (bookData) => {
      return bookData.image || '/images/book-placeholder.svg'
    }

    const handleImageError = (event) => {
      event.target.src = '/images/book-placeholder.svg'
    }

    const formatPrice = (price) => {
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(price)
    }

    onMounted(() => {
      loadBook()
    })

    return {
      book,
      relatedBooks,
      loading,
      borrowBook,
      viewBook,
      getBookImage,
      handleImageError,
      formatPrice
    }
  }
}
</script>

<style scoped>
.book-detail-image {
  max-width: 100%;
  height: auto;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.book-title {
  color: #2c3e50;
  font-weight: 700;
}

.meta-item {
  padding: 0.5rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.meta-item:last-child {
  border-bottom: none;
}

.book-card {
  cursor: pointer;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}

.book-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
}

.book-thumb {
  height: 150px;
  object-fit: cover;
}

.book-actions .btn {
  min-width: 150px;
}

@media (max-width: 768px) {
  .book-actions .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .book-actions .btn:last-child {
    margin-bottom: 0;
  }
}
</style>