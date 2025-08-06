<template>
  <footer class="bg-light text-center text-lg-start mt-5">
    <div class="container py-5">
      <!-- Statistics Section -->
      <div class="row mb-4 pb-4 border-bottom">
        <div class="col-12">
          <div class="row text-center">
            <div class="col-6 col-md-3 mb-3">
              <div class="stat-item">
                <h4 class="text-primary fw-bold">{{ stats.totalBooks }}</h4>
                <small class="text-muted">Tổng số sách</small>
              </div>
            </div>
            <div class="col-6 col-md-3 mb-3">
              <div class="stat-item">
                <h4 class="text-success fw-bold">{{ stats.totalMembers }}</h4>
                <small class="text-muted">Thành viên</small>
              </div>
            </div>
            <div class="col-6 col-md-3 mb-3">
              <div class="stat-item">
                <h4 class="text-info fw-bold">{{ stats.totalBorrows }}</h4>
                <small class="text-muted">Lượt mượn</small>
              </div>
            </div>
            <div class="col-6 col-md-3 mb-3">
              <div class="stat-item">
                <h4 class="text-warning fw-bold">{{ stats.totalCategories }}</h4>
                <small class="text-muted">Nhà xuất bản</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="row footer-content">
        <!-- Contact Section -->
        <div class="col-md-4 mb-4">
          <h5 class="text-uppercase fw-bold mb-3">
            <i class="fas fa-phone text-primary me-2"></i>
            Liên hệ
          </h5>
          <ul class="list-unstyled">
            <li class="mb-2">
              <a href="mailto:library@example.com" class="text-decoration-none text-muted">
                <i class="fas fa-envelope me-2"></i>
                library@example.com
              </a>
            </li>
            <li class="mb-2">
              <a href="tel:+84123456789" class="text-decoration-none text-muted">
                <i class="fas fa-phone me-2"></i>
                (84) 123 456 789
              </a>
            </li>
            <li class="mb-2">
              <span class="text-muted">
                <i class="fas fa-map-marker-alt me-2"></i>
                Khu dân cư 91B, Cần Thơ
              </span>
            </li>
            <li class="mb-2">
              <span class="text-muted">
                <i class="fas fa-clock me-2"></i>
                T2-T6: 8:00 - 17:00, T7: 8:00 - 12:00
              </span>
            </li>
          </ul>
        </div>

        <!-- Library Info Section -->
        <div class="col-md-4 mb-4 text-center">
          <router-link to="/" class="text-decoration-none">
            <img src="/images/logo.png" alt="Thư viện" class="img-fluid mb-3 footer-logo" @error="handleLogoError">
          </router-link>
          <h4 class="fw-bold text-primary mb-3">Thư viện sách điện tử</h4>
          <p class="text-muted mb-3">
            Hệ thống quản lý thư viện hiện đại, cung cấp dịch vụ mượn trả sách trực tuyến
            với kho tàng tri thức phong phú và đa dạng.
          </p>

          <!-- Social Media -->
          <div class="social-links">
            <a href="#" class="btn btn-outline-primary btn-sm me-2" title="Facebook">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a href="#" class="btn btn-outline-info btn-sm me-2" title="Twitter">
              <i class="fab fa-twitter"></i>
            </a>
            <a href="#" class="btn btn-outline-danger btn-sm me-2" title="YouTube">
              <i class="fab fa-youtube"></i>
            </a>
            <a href="#" class="btn btn-outline-success btn-sm" title="WhatsApp">
              <i class="fab fa-whatsapp"></i>
            </a>
          </div>
        </div>

        <!-- Quick Links Section -->
        <div class="col-md-4 mb-4">
          <h5 class="text-uppercase fw-bold mb-3">
            <i class="fas fa-link text-primary me-2"></i>
            Liên kết hữu ích
          </h5>
          <div class="row">
            <div class="col-6">
              <ul class="list-unstyled">
                <li class="mb-2">
                  <router-link to="/" class="text-decoration-none text-muted">
                    <i class="fas fa-home me-2"></i>Trang chủ
                  </router-link>
                </li>
                <li class="mb-2">
                  <router-link to="/books" class="text-decoration-none text-muted">
                    <i class="fas fa-book me-2"></i>Tất cả sách
                  </router-link>
                </li>
                <li class="mb-2">
                  <router-link to="/categories" class="text-decoration-none text-muted">
                    <i class="fas fa-tags me-2"></i>Nhà xuất bản
                  </router-link>
                </li>
                <li class="mb-2">
                  <router-link to="/about" class="text-decoration-none text-muted">
                    <i class="fas fa-info-circle me-2"></i>Giới thiệu
                  </router-link>
                </li>
              </ul>
            </div>
            <div class="col-6">
              <ul class="list-unstyled">
                <li class="mb-2">
                  <router-link to="/privacy" class="text-decoration-none text-muted">
                    <i class="fas fa-shield-alt me-2"></i>Bảo mật
                  </router-link>
                </li>
                <li class="mb-2">
                  <router-link to="/terms" class="text-decoration-none text-muted">
                    <i class="fas fa-file-contract me-2"></i>Điều khoản
                  </router-link>
                </li>
                <li class="mb-2">
                  <router-link to="/help" class="text-decoration-none text-muted">
                    <i class="fas fa-question-circle me-2"></i>Trợ giúp
                  </router-link>
                </li>
                <li class="mb-2">
                  <router-link to="/contact" class="text-decoration-none text-muted">
                    <i class="fas fa-envelope me-2"></i>Liên hệ
                  </router-link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Back to Top Button -->
    <button v-show="showBackToTop" @click="scrollToTop" class="btn btn-primary btn-floating back-to-top"
      title="Về đầu trang">
      <i class="fas fa-arrow-up"></i>
    </button>
  </footer>
</template>

<script>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import axios from '@/utils/axios'

export default {
  name: 'PublicFooter',
  setup() {
    const showBackToTop = ref(false)
    const stats = ref({
      totalBooks: 0,
      totalMembers: 0,
      totalBorrows: 0,
      totalCategories: 0
    })

    const currentYear = computed(() => new Date().getFullYear())

    const loadStats = async () => {
      try {
        // Load basic stats from APIs (không truyền limit)
        const [booksRes, membersRes, categoriesRes, borrowsRes] = await Promise.all([
          axios.get('/sach').catch(() => ({ data: { data: [], pagination: { total: 0 } } })),
          axios.get('/docgia').catch(() => ({ data: { data: [], pagination: { total: 0 } } })),
          axios.get('/nhaxuatban').catch(() => ({ data: { data: [], pagination: { total: 0 } } })),
        ])

        // Lấy tổng số linh hoạt: ưu tiên pagination.total, fallback sang data.length
        const getTotal = (res) => {
          if (res.data && res.data.pagination && typeof res.data.pagination.total === 'number') {
            return res.data.pagination.total
          }
          if (Array.isArray(res.data.data)) {
            return res.data.data.length
          }
          return 0
        }

        stats.value = {
          totalBooks: getTotal(booksRes),
          totalMembers: getTotal(membersRes),
          totalBorrows: getTotal(borrowsRes),
          totalCategories: getTotal(categoriesRes)
        }
      } catch (error) {
        // console.error('Error loading footer stats:', error)
        // Use default values if API fails
        stats.value = {
          totalBooks: 10,
          totalMembers: 8,
          totalBorrows: 13,
          totalCategories: 15
        }
      }
    }

    const handleScroll = () => {
      showBackToTop.value = window.pageYOffset > 300
    }

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }

    onMounted(() => {
      loadStats()
      window.addEventListener('scroll', handleScroll)
    })

    const handleLogoError = (event) => {
      // Hide logo if it fails to load
      event.target.style.display = 'none'
    }

    onUnmounted(() => {
      window.removeEventListener('scroll', handleScroll)
    })

    return {
      showBackToTop,
      stats,
      currentYear,
      scrollToTop,
      handleLogoError
    }
  }
}
</script>

<style scoped>
.footer-logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.footer-content a {
  transition: color 0.3s ease;
}

.footer-content a:hover {
  color: #0d6efd !important;
}

.social-links .btn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.social-links .btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.stat-item h4 {
  font-size: 1.8rem;
  margin-bottom: 0.25rem;
}

.back-to-top {
  position: fixed;
  bottom: 30px;
  right: 30px;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  transition: all 0.3s ease;
}

.back-to-top:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.4);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .footer-content {
    text-align: center;
  }

  .footer-content .col-md-4 {
    margin-bottom: 2rem;
  }

  .back-to-top {
    bottom: 20px;
    right: 20px;
    width: 45px;
    height: 45px;
  }

  .stat-item h4 {
    font-size: 1.5rem;
  }
}

/* Animation for stats */
.stat-item {
  transition: transform 0.3s ease;
}

.stat-item:hover {
  transform: translateY(-2px);
}

/* Custom link styles */
.list-unstyled a {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0;
  transition: all 0.3s ease;
}

.list-unstyled a:hover {
  padding-left: 0.5rem;
  color: #0d6efd !important;
}

.list-unstyled a i {
  width: 20px;
  text-align: center;
}
</style>