<template>
  <div class="about-page">
    <!-- Page Header (improved, đồng bộ BooksList) -->
    <div class="page-header bg-primary text-white py-5 mb-5 rounded-3 shadow-sm">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="display-4 fw-bold mb-3">
              <i class="fas fa-university fa-lg me-2"></i>
              Về chúng tôi
            </h1>
            <p class="lead mb-0 opacity-75">Hệ thống thư viện hiện đại, phục vụ cộng đồng với tình yêu tri thức</p>
          </div>
          <div class="col-md-4 text-center text-md-end mt-4 mt-md-0">
            <i class="fas fa-university fa-4x opacity-75"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Mission Section -->
    <div class="mission-section mb-5">
      <div class="container">
        <div class="row">
          <div class="col-lg-8 mx-auto text-center">
            <h2 class="mb-4">Sứ mệnh của chúng tôi</h2>
            <p class="lead text-muted mb-4">
              Cung cấp dịch vụ thư viện chất lượng cao, tạo môi trường học tập lý tưởng 
              và thúc đẩy văn hóa đọc trong cộng đồng.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Features Section -->
    <div class="features-section mb-5">
      <div class="container">
        <h2 class="text-center mb-5">Dịch vụ của chúng tôi</h2>
        <div class="row g-4">
          <div class="col-md-4">
            <div class="feature-card text-center p-4">
              <div class="feature-icon mb-3">
                <i class="fas fa-book-open fa-3x text-primary"></i>
              </div>
              <h4>Kho sách phong phú</h4>
              <p class="text-muted">
                Hàng ngàn đầu sách từ nhiều lĩnh vực khác nhau, 
                được cập nhật thường xuyên.
              </p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="feature-card text-center p-4">
              <div class="feature-icon mb-3">
                <i class="fas fa-laptop fa-3x text-success"></i>
              </div>
              <h4>Hệ thống hiện đại</h4>
              <p class="text-muted">
                Quản lý mượn trả trực tuyến, tìm kiếm thông minh 
                và theo dõi lịch sử đọc.
              </p>
            </div>
          </div>
          <div class="col-md-4">
            <div class="feature-card text-center p-4">
              <div class="feature-icon mb-3">
                <i class="fas fa-users fa-3x text-info"></i>
              </div>
              <h4>Phục vụ tận tâm</h4>
              <p class="text-muted">
                Đội ngũ thủ thư chuyên nghiệp, nhiệt tình 
                hỗ trợ độc giả 24/7.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Stats Section -->
    <div class="stats-section bg-light py-5 mb-5">
      <div class="container">
        <div class="row text-center">
          <div class="col-md-3 col-6 mb-4">
            <div class="stat-item">
              <h2 class="text-primary fw-bold">{{ stats.totalBooks }}</h2>
              <p class="text-muted mb-0">Đầu sách</p>
            </div>
          </div>
          <div class="col-md-3 col-6 mb-4">
            <div class="stat-item">
              <h2 class="text-success fw-bold">{{ stats.totalMembers }}</h2>
              <p class="text-muted mb-0">Thành viên</p>
            </div>
          </div>
          <div class="col-md-3 col-6 mb-4">
            <div class="stat-item">
              <h2 class="text-info fw-bold">{{ stats.totalBorrows }}</h2>
              <p class="text-muted mb-0">Lượt mượn</p>
            </div>
          </div>
          <div class="col-md-3 col-6 mb-4">
            <div class="stat-item">
              <h2 class="text-warning fw-bold">15+</h2>
              <p class="text-muted mb-0">Năm phục vụ</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- History Section -->
    <div class="history-section mb-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h2 class="mb-4">Lịch sử hình thành</h2>
            <div class="timeline">
              <div class="timeline-item mb-4">
                <div class="timeline-marker bg-primary"></div>
                <div class="timeline-content">
                  <h5>2008 - Thành lập</h5>
                  <p class="text-muted">
                    Thư viện được thành lập với 1000 đầu sách đầu tiên
                  </p>
                </div>
              </div>
              <div class="timeline-item mb-4">
                <div class="timeline-marker bg-success"></div>
                <div class="timeline-content">
                  <h5>2015 - Số hóa</h5>
                  <p class="text-muted">
                    Triển khai hệ thống quản lý thư viện số
                  </p>
                </div>
              </div>
              <div class="timeline-item mb-4">
                <div class="timeline-marker bg-info"></div>
                <div class="timeline-content">
                  <h5>2020 - Mở rộng</h5>
                  <p class="text-muted">
                    Mở rộng không gian và tăng cường dịch vụ trực tuyến
                  </p>
                </div>
              </div>
              <div class="timeline-item">
                <div class="timeline-marker bg-warning"></div>
                <div class="timeline-content">
                  <h5>2024 - Hiện tại</h5>
                  <p class="text-muted">
                    Phục vụ hơn 10,000 độc giả với kho sách phong phú
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="image-placeholder bg-light rounded p-5 text-center">
              <img src="/images/library.jpg" alt="">
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Team Section -->
    <div class="team-section mb-5">
      <div class="container">
        <h2 class="text-center mb-5">Đội ngũ của chúng tôi</h2>
        <div class="row g-4">
          <div class="col-md-4" v-for="member in teamMembers" :key="member.id">
            <div class="team-card text-center">
              <div class="team-avatar mb-3">
                <img 
                  :src="member.avatar || '/images/avatar-default.svg'" 
                  :alt="member.name"
                  class="rounded-circle"
                  style="width: 120px; height: 120px; object-fit: cover;"
                >
              </div>
              <h5>{{ member.name }}</h5>
              <p class="text-primary">{{ member.position }}</p>
              <p class="text-muted small">{{ member.description }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Contact CTA (improved, đồng bộ Contact.vue) -->
    <div class="contact-cta-section bg-primary text-white py-5 mt-5 rounded-3 shadow-sm">
      <div class="container text-center">
        <h2 class="display-6 fw-bold mb-3">
          <i class="fas fa-headset fa-lg me-2"></i>
          Bạn có câu hỏi nào không?
        </h2>
        <p class="lead mb-4 opacity-75">
          Đội ngũ của chúng tôi luôn sẵn sàng hỗ trợ và giải đáp mọi thắc mắc của bạn!
        </p>
        <router-link to="/contact" class="btn btn-light btn-lg px-4 me-2 mb-2">
          <i class="fas fa-phone-alt me-2"></i> Liên hệ ngay
        </router-link>
        <a href="mailto:library@example.com" class="btn btn-outline-light btn-lg px-4 mb-2">
          <i class="fas fa-envelope me-2"></i> Gửi email
        </a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.contact-cta-section {
  background: linear-gradient(90deg, #0d6efd 60%, #2563eb 100%);
}
.contact-cta-section .btn {
  min-width: 220px;
  font-size: 1.1rem;
}
</style>

<script>
import { ref, onMounted } from 'vue'
import axios from '@/utils/axios'

export default {
  name: 'About',
  setup() {
    const stats = ref({
      totalBooks: 0,
      totalMembers: 0,
      totalBorrows: 0
    })

    const teamMembers = ref([])

    const loadStats = async () => {
      try {
        const [booksRes, membersRes] = await Promise.all([
          axios.get('sach?limit=1').catch(() => ({ data: { data: { pagination: { total: 0 } } } })),
          axios.get('docgia?limit=1').catch(() => ({ data: { data: { pagination: { total: 0 } } } }))
        ])

        stats.value = {
          totalBooks: booksRes.data.data.pagination?.total || 1250,
          totalMembers: membersRes.data.data.pagination?.total || 850,
          totalBorrows: 3200
        }
      } catch (error) {
        console.error('Error loading stats:', error)
        // Use default values
        stats.value = {
          totalBooks: 1250,
          totalMembers: 850,
          totalBorrows: 3200
        }
      }
    }


    const loadTeamMembers = async () => {
      try {
        const res = await axios.get('nhanvien', {
          params: {
            sortBy: 'NgayVaoLam',
            sortOrder: 'asc',
            limit: 3
          }
        })
        console.log('NhanVien API res.data:', res.data);
        console.log('NhanVien API res.data.data:', res.data.data);
        let arr = [];
        if (Array.isArray(res.data.data)) {
          arr = res.data.data;
        } else if (res.data.data && Array.isArray(res.data.data.nhanviens)) {
          arr = res.data.data.nhanviens;
        }
        teamMembers.value = arr.map((nv, idx) => ({
          id: nv.MSNV || idx,
          name: nv.HoTenNV,
          position: nv.ChucVu,
          description: nv.DiaChi || '',
          avatar: nv.avatar || null
        }))
      } catch (error) {
        console.error('Không thể tải danh sách nhân viên:', error)
      }
    }

    onMounted(() => {
      loadStats()
      loadTeamMembers()
    })

    return {
      stats,
      teamMembers
    }
  }
}
</script>

<style>
@import '@/assets/styles/pages/static-pages.css';

/* About specific styles */
.feature-card {
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.stat-item h2 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0.75rem;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #dee2e6;
}

.timeline-item {
  position: relative;
}

.timeline-marker {
  position: absolute;
  left: -2rem;
  top: 0.25rem;
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  border: 3px solid white;
  box-shadow: 0 0 0 3px #dee2e6;
}

.timeline-content {
  padding-left: 1rem;
}

.team-card {
  padding: 2rem 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.team-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.image-placeholder {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .stat-item h2 {
    font-size: 2rem;
  }
  
  .timeline {
    padding-left: 1.5rem;
  }
  
  .timeline-marker {
    left: -1.5rem;
  }
}
</style>