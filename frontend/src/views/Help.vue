<template>
  <div class="help-page">
    <!-- Page Header -->
    <div class="page-header bg-info text-white py-5 mb-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="display-4 fw-bold mb-3">Trợ giúp</h1>
            <p class="lead">
              Hướng dẫn sử dụng hệ thống thư viện
            </p>
          </div>
          <div class="col-md-4 text-center">
            <i class="fas fa-question-circle fa-5x opacity-75"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-lg-3 mb-4">
          <div class="help-sidebar sticky-top" style="top: 100px;">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0">
                <h6 class="mb-0">Danh mục trợ giúp</h6>
              </div>
              <div class="card-body p-0">
                <div class="list-group list-group-flush">
                  <button 
                    v-for="category in categories" 
                    :key="category.id"
                    class="list-group-item list-group-item-action border-0"
                    :class="{ active: activeCategory === category.id }"
                    @click="activeCategory = category.id"
                  >
                    <i :class="category.icon" class="me-2"></i>
                    {{ category.name }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-lg-9">
          <!-- Search -->
          <div class="search-section mb-4">
            <div class="card border-0 shadow-sm">
              <div class="card-body">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="fas fa-search"></i>
                  </span>
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Tìm kiếm câu hỏi..."
                    v-model="searchQuery"
                  >
                </div>
              </div>
            </div>
          </div>

          <!-- Help Content -->
          <div class="help-content">
            <!-- Getting Started -->
            <div v-if="activeCategory === 'getting-started'" class="help-section">
              <h2 class="mb-4">Bắt đầu sử dụng</h2>
              
              <div class="accordion" id="gettingStartedAccordion">
                <div class="accordion-item mb-3">
                  <h5 class="accordion-header">
                    <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#register">
                      Làm thế nào để đăng ký tài khoản?
                    </button>
                  </h5>
                  <div id="register" class="accordion-collapse collapse show" data-bs-parent="#gettingStartedAccordion">
                    <div class="accordion-body">
                      <ol>
                        <li>Nhấp vào nút "Đăng ký" ở góc trên bên phải</li>
                        <li>Điền đầy đủ thông tin cá nhân</li>
                        <li>Xác nhận email đăng ký</li>
                        <li>Đăng nhập và bắt đầu sử dụng</li>
                      </ol>
                      <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Bạn cần có CMND/CCCD hợp lệ để đăng ký tài khoản.
                      </div>
                    </div>
                  </div>
                </div>

                <div class="accordion-item mb-3">
                  <h5 class="accordion-header">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#login">
                      Cách đăng nhập vào hệ thống
                    </button>
                  </h5>
                  <div id="login" class="accordion-collapse collapse" data-bs-parent="#gettingStartedAccordion">
                    <div class="accordion-body">
                      <ol>
                        <li>Nhấp vào nút "Đăng nhập"</li>
                        <li>Nhập mã độc giả và mật khẩu</li>
                        <li>Nhấp "Đăng nhập"</li>
                      </ol>
                      <div class="alert alert-warning">
                        <i class="fas fa-exclamation-triangle me-2"></i>
                        Nếu quên mật khẩu, hãy liên hệ thủ thư để được hỗ trợ.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Borrowing -->
            <div v-if="activeCategory === 'borrowing'" class="help-section">
              <h2 class="mb-4">Mượn trả sách</h2>
              
              <div class="row g-4">
                <div class="col-md-6">
                  <div class="help-card">
                    <div class="help-card-icon">
                      <i class="fas fa-book text-primary"></i>
                    </div>
                    <h5>Cách mượn sách</h5>
                    <ul>
                      <li>Tìm kiếm sách cần mượn</li>
                      <li>Nhấp "Mượn sách"</li>
                      <li>Chọn ngày hẹn trả</li>
                      <li>Xác nhận mượn sách</li>
                    </ul>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div class="help-card">
                    <div class="help-card-icon">
                      <i class="fas fa-undo text-success"></i>
                    </div>
                    <h5>Cách trả sách</h5>
                    <ul>
                      <li>Vào "Sách đang mượn"</li>
                      <li>Chọn sách cần trả</li>
                      <li>Nhấp "Trả sách"</li>
                      <li>Xác nhận trả sách</li>
                    </ul>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div class="help-card">
                    <div class="help-card-icon">
                      <i class="fas fa-calendar text-warning"></i>
                    </div>
                    <h5>Gia hạn sách</h5>
                    <ul>
                      <li>Vào "Sách đang mượn"</li>
                      <li>Chọn "Gia hạn"</li>
                      <li>Chọn ngày hẹn trả mới</li>
                      <li>Xác nhận gia hạn</li>
                    </ul>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div class="help-card">
                    <div class="help-card-icon">
                      <i class="fas fa-exclamation-triangle text-danger"></i>
                    </div>
                    <h5>Sách quá hạn</h5>
                    <ul>
                      <li>Phí phạt: 2,000 VNĐ/ngày</li>
                      <li>Không thể mượn sách mới</li>
                      <li>Cần trả sách và phí phạt</li>
                      <li>Liên hệ thủ thư nếu cần hỗ trợ</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <!-- Account -->
            <div v-if="activeCategory === 'account'" class="help-section">
              <h2 class="mb-4">Quản lý tài khoản</h2>
              
              <div class="help-topics">
                <div class="topic-item mb-4">
                  <h5><i class="fas fa-user text-primary me-2"></i>Cập nhật thông tin cá nhân</h5>
                  <p>Vào "Trang cá nhân" → "Chỉnh sửa thông tin" để cập nhật thông tin.</p>
                </div>
                
                <div class="topic-item mb-4">
                  <h5><i class="fas fa-lock text-warning me-2"></i>Đổi mật khẩu</h5>
                  <p>Vào "Trang cá nhân" → "Đổi mật khẩu" để thay đổi mật khẩu.</p>
                </div>
                
                <div class="topic-item mb-4">
                  <h5><i class="fas fa-history text-info me-2"></i>Xem lịch sử mượn sách</h5>
                  <p>Vào "Lịch sử mượn" để xem tất cả sách đã mượn.</p>
                </div>
              </div>
            </div>

            <!-- Search -->
            <div v-if="activeCategory === 'search'" class="help-section">
              <h2 class="mb-4">Tìm kiếm sách</h2>
              
              <div class="search-tips">
                <div class="tip-item mb-4">
                  <h5><i class="fas fa-search text-primary me-2"></i>Tìm kiếm cơ bản</h5>
                  <p>Nhập tên sách, tác giả hoặc từ khóa vào ô tìm kiếm.</p>
                </div>
                
                <div class="tip-item mb-4">
                  <h5><i class="fas fa-filter text-success me-2"></i>Lọc kết quả</h5>
                  <p>Sử dụng bộ lọc theo nhà xuất bản, năm xuất bản, tình trạng sách.</p>
                </div>
                
                <div class="tip-item mb-4">
                  <h5><i class="fas fa-sort text-info me-2"></i>Sắp xếp</h5>
                  <p>Sắp xếp kết quả theo tên, tác giả, năm xuất bản hoặc giá.</p>
                </div>
              </div>
            </div>

            <!-- Technical -->
            <div v-if="activeCategory === 'technical'" class="help-section">
              <h2 class="mb-4">Hỗ trợ kỹ thuật</h2>
              
              <div class="technical-help">
                <div class="alert alert-info">
                  <h5><i class="fas fa-globe me-2"></i>Trình duyệt được hỗ trợ</h5>
                  <ul class="mb-0">
                    <li>Chrome 90+</li>
                    <li>Firefox 88+</li>
                    <li>Safari 14+</li>
                    <li>Edge 90+</li>
                  </ul>
                </div>
                
                <div class="alert alert-warning">
                  <h5><i class="fas fa-exclamation-triangle me-2"></i>Khắc phục sự cố</h5>
                  <ul class="mb-0">
                    <li>Xóa cache và cookies</li>
                    <li>Tắt các extension chặn quảng cáo</li>
                    <li>Kiểm tra kết nối internet</li>
                    <li>Thử trình duyệt khác</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <!-- Contact Support -->
          <div class="support-section mt-5">
            <div class="card border-0 shadow-sm bg-light">
              <div class="card-body text-center py-4">
                <h5 class="mb-3">Không tìm thấy câu trả lời?</h5>
                <p class="text-muted mb-4">
                  Đội ngũ hỗ trợ của chúng tôi luôn sẵn sàng giúp đỡ bạn
                </p>
                <div class="d-flex gap-3 justify-content-center flex-wrap">
                  <router-link to="/contact" class="btn btn-primary">
                    <i class="fas fa-envelope me-2"></i>
                    Gửi tin nhắn
                  </router-link>
                  <a href="tel:+84123456789" class="btn btn-outline-primary">
                    <i class="fas fa-phone me-2"></i>
                    Gọi điện
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Help',
  setup() {
    const activeCategory = ref('getting-started')
    const searchQuery = ref('')

    const categories = ref([
      {
        id: 'getting-started',
        name: 'Bắt đầu sử dụng',
        icon: 'fas fa-play-circle'
      },
      {
        id: 'borrowing',
        name: 'Mượn trả sách',
        icon: 'fas fa-book'
      },
      {
        id: 'account',
        name: 'Quản lý tài khoản',
        icon: 'fas fa-user'
      },
      {
        id: 'search',
        name: 'Tìm kiếm sách',
        icon: 'fas fa-search'
      },
      {
        id: 'technical',
        name: 'Hỗ trợ kỹ thuật',
        icon: 'fas fa-cog'
      }
    ])

    return {
      activeCategory,
      searchQuery,
      categories
    }
  }
}
</script>

<style>
@import '@/assets/styles/pages/static-pages.css';

/* Help specific styles */
.help-sidebar {
  z-index: 10;
}

.list-group-item-action.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
}

.help-card {
  padding: 2rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  height: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.help-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.1);
}

.help-card-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.topic-item, .tip-item {
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  background: white;
}

.accordion-button:not(.collapsed) {
  background-color: #e7f3ff;
  color: #0d6efd;
}

@media (max-width: 992px) {
  .help-sidebar {
    position: static !important;
  }
}

@media (max-width: 768px) {
  .help-card {
    padding: 1.5rem;
  }
  
  .topic-item, .tip-item {
    padding: 1rem;
  }
}
</style>