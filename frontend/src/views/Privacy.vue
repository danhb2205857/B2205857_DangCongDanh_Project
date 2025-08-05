<template>
  <div class="privacy-page">
    <!-- Page Header -->
    <div class="page-header bg-success text-white py-5 mb-5">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="display-4 fw-bold mb-3">Chính sách bảo mật</h1>
            <p class="lead">
              Cam kết bảo vệ thông tin cá nhân của bạn
            </p>
          </div>
          <div class="col-md-4 text-center">
            <i class="fas fa-shield-alt fa-5x opacity-75"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <!-- Table of Contents -->
        <div class="col-lg-3 mb-4">
          <div class="toc-sidebar sticky-top" style="top: 100px;">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0">
                <h6 class="mb-0">Mục lục</h6>
              </div>
              <div class="card-body p-0">
                <div class="list-group list-group-flush">
                  <a 
                    v-for="section in sections" 
                    :key="section.id"
                    :href="`#${section.id}`"
                    class="list-group-item list-group-item-action border-0"
                    @click="scrollToSection(section.id)"
                  >
                    {{ section.title }}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-lg-9">
          <div class="privacy-content">
            <!-- Introduction -->
            <section id="introduction" class="content-section mb-5">
              <h2>1. Giới thiệu</h2>
              <p>
                Chính sách bảo mật này mô tả cách chúng tôi thu thập, sử dụng và bảo vệ 
                thông tin cá nhân của bạn khi sử dụng hệ thống thư viện.
              </p>
              <p>
                Bằng cách sử dụng dịch vụ của chúng tôi, bạn đồng ý với các điều khoản 
                trong chính sách bảo mật này.
              </p>
              <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Cập nhật lần cuối:</strong> {{ lastUpdated }}
              </div>
            </section>

            <!-- Information Collection -->
            <section id="collection" class="content-section mb-5">
              <h2>2. Thu thập thông tin</h2>
              <h4>2.1. Thông tin cá nhân</h4>
              <p>Chúng tôi thu thập các thông tin sau:</p>
              <ul>
                <li>Họ tên, ngày sinh, giới tính</li>
                <li>Địa chỉ liên lạc, số điện thoại</li>
                <li>Email và thông tin đăng nhập</li>
                <li>Số CMND/CCCD (để xác thực)</li>
              </ul>

              <h4>2.2. Thông tin sử dụng dịch vụ</h4>
              <ul>
                <li>Lịch sử mượn trả sách</li>
                <li>Sở thích đọc và tìm kiếm</li>
                <li>Thời gian truy cập hệ thống</li>
                <li>Địa chỉ IP và thông tin thiết bị</li>
              </ul>
            </section>

            <!-- Information Usage -->
            <section id="usage" class="content-section mb-5">
              <h2>3. Sử dụng thông tin</h2>
              <p>Thông tin của bạn được sử dụng để:</p>
              
              <div class="row g-4">
                <div class="col-md-6">
                  <div class="usage-card">
                    <div class="usage-icon">
                      <i class="fas fa-user-check text-primary"></i>
                    </div>
                    <h5>Quản lý tài khoản</h5>
                    <ul>
                      <li>Xác thực danh tính</li>
                      <li>Quản lý thông tin cá nhân</li>
                      <li>Hỗ trợ khách hàng</li>
                    </ul>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div class="usage-card">
                    <div class="usage-icon">
                      <i class="fas fa-book text-success"></i>
                    </div>
                    <h5>Dịch vụ thư viện</h5>
                    <ul>
                      <li>Quản lý mượn trả sách</li>
                      <li>Gửi thông báo hạn trả</li>
                      <li>Đề xuất sách phù hợp</li>
                    </ul>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div class="usage-card">
                    <div class="usage-icon">
                      <i class="fas fa-chart-bar text-info"></i>
                    </div>
                    <h5>Phân tích và cải thiện</h5>
                    <ul>
                      <li>Thống kê sử dụng</li>
                      <li>Cải thiện dịch vụ</li>
                      <li>Phát triển tính năng mới</li>
                    </ul>
                  </div>
                </div>
                
                <div class="col-md-6">
                  <div class="usage-card">
                    <div class="usage-icon">
                      <i class="fas fa-bell text-warning"></i>
                    </div>
                    <h5>Thông báo</h5>
                    <ul>
                      <li>Thông báo hệ thống</li>
                      <li>Cập nhật chính sách</li>
                      <li>Sự kiện thư viện</li>
                    </ul>
                  </div>
                </div>
              </div>
            </section>

            <!-- Information Protection -->
            <section id="protection" class="content-section mb-5">
              <h2>4. Bảo vệ thông tin</h2>
              <p>Chúng tôi áp dụng các biện pháp bảo mật sau:</p>
              
              <div class="protection-measures">
                <div class="measure-item">
                  <div class="measure-icon">
                    <i class="fas fa-lock text-primary"></i>
                  </div>
                  <div class="measure-content">
                    <h5>Mã hóa dữ liệu</h5>
                    <p>Tất cả dữ liệu được mã hóa khi truyền tải và lưu trữ.</p>
                  </div>
                </div>
                
                <div class="measure-item">
                  <div class="measure-icon">
                    <i class="fas fa-server text-success"></i>
                  </div>
                  <div class="measure-content">
                    <h5>Máy chủ an toàn</h5>
                    <p>Hệ thống được lưu trữ trên máy chủ có bảo mật cao.</p>
                  </div>
                </div>
                
                <div class="measure-item">
                  <div class="measure-icon">
                    <i class="fas fa-user-shield text-info"></i>
                  </div>
                  <div class="measure-content">
                    <h5>Kiểm soát truy cập</h5>
                    <p>Chỉ nhân viên được ủy quyền mới có thể truy cập dữ liệu.</p>
                  </div>
                </div>
                
                <div class="measure-item">
                  <div class="measure-icon">
                    <i class="fas fa-backup text-warning"></i>
                  </div>
                  <div class="measure-content">
                    <h5>Sao lưu định kỳ</h5>
                    <p>Dữ liệu được sao lưu thường xuyên để tránh mất mát.</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Information Sharing -->
            <section id="sharing" class="content-section mb-5">
              <h2>5. Chia sẻ thông tin</h2>
              <div class="alert alert-warning">
                <i class="fas fa-exclamation-triangle me-2"></i>
                <strong>Cam kết:</strong> Chúng tôi KHÔNG bán, cho thuê hoặc chia sẻ 
                thông tin cá nhân của bạn với bên thứ ba vì mục đích thương mại.
              </div>
              
              <p>Thông tin có thể được chia sẻ trong các trường hợp sau:</p>
              <ul>
                <li>Khi có yêu cầu từ cơ quan pháp luật</li>
                <li>Để bảo vệ quyền lợi và an toàn của thư viện</li>
                <li>Với sự đồng ý rõ ràng của bạn</li>
                <li>Với các đối tác dịch vụ (được ký hợp đồng bảo mật)</li>
              </ul>
            </section>

            <!-- User Rights -->
            <section id="rights" class="content-section mb-5">
              <h2>6. Quyền của người dùng</h2>
              <p>Bạn có các quyền sau đối với thông tin cá nhân:</p>
              
              <div class="rights-grid">
                <div class="right-item">
                  <i class="fas fa-eye text-primary"></i>
                  <h6>Quyền truy cập</h6>
                  <p>Xem thông tin cá nhân được lưu trữ</p>
                </div>
                
                <div class="right-item">
                  <i class="fas fa-edit text-success"></i>
                  <h6>Quyền chỉnh sửa</h6>
                  <p>Cập nhật thông tin cá nhân</p>
                </div>
                
                <div class="right-item">
                  <i class="fas fa-trash text-danger"></i>
                  <h6>Quyền xóa</h6>
                  <p>Yêu cầu xóa thông tin cá nhân</p>
                </div>
                
                <div class="right-item">
                  <i class="fas fa-download text-info"></i>
                  <h6>Quyền xuất dữ liệu</h6>
                  <p>Tải xuống dữ liệu cá nhân</p>
                </div>
                
                <div class="right-item">
                  <i class="fas fa-ban text-warning"></i>
                  <h6>Quyền từ chối</h6>
                  <p>Từ chối xử lý dữ liệu</p>
                </div>
                
                <div class="right-item">
                  <i class="fas fa-shield-alt text-secondary"></i>
                  <h6>Quyền khiếu nại</h6>
                  <p>Khiếu nại về xử lý dữ liệu</p>
                </div>
              </div>
            </section>

            <!-- Cookies -->
            <section id="cookies" class="content-section mb-5">
              <h2>7. Cookies và công nghệ theo dõi</h2>
              <p>Chúng tôi sử dụng cookies để:</p>
              <ul>
                <li>Ghi nhớ thông tin đăng nhập</li>
                <li>Cải thiện trải nghiệm người dùng</li>
                <li>Phân tích lưu lượng truy cập</li>
                <li>Cá nhân hóa nội dung</li>
              </ul>
              
              <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                Bạn có thể tắt cookies trong cài đặt trình duyệt, nhưng một số 
                tính năng có thể không hoạt động bình thường.
              </div>
            </section>

            <!-- Contact -->
            <section id="contact" class="content-section mb-5">
              <h2>8. Liên hệ</h2>
              <p>
                Nếu bạn có câu hỏi về chính sách bảo mật này, vui lòng liên hệ:
              </p>
              
              <div class="contact-info">
                <div class="contact-item">
                  <i class="fas fa-envelope text-primary"></i>
                  <span>Email: privacy@library.com</span>
                </div>
                <div class="contact-item">
                  <i class="fas fa-phone text-success"></i>
                  <span>Điện thoại: (84) 123 456 789</span>
                </div>
                <div class="contact-item">
                  <i class="fas fa-map-marker-alt text-info"></i>
                  <span>Địa chỉ: 123 Đường ABC, Quận 1, TP.HCM</span>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref } from 'vue'

export default {
  name: 'Privacy',
  setup() {
    const lastUpdated = ref('01/01/2024')
    
    const sections = ref([
      { id: 'introduction', title: '1. Giới thiệu' },
      { id: 'collection', title: '2. Thu thập thông tin' },
      { id: 'usage', title: '3. Sử dụng thông tin' },
      { id: 'protection', title: '4. Bảo vệ thông tin' },
      { id: 'sharing', title: '5. Chia sẻ thông tin' },
      { id: 'rights', title: '6. Quyền của người dùng' },
      { id: 'cookies', title: '7. Cookies' },
      { id: 'contact', title: '8. Liên hệ' }
    ])

    const scrollToSection = (sectionId) => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }

    return {
      lastUpdated,
      sections,
      scrollToSection
    }
  }
}
</script>

<style>
@import '@/assets/styles/pages/static-pages.css';

/* Privacy specific styles */
.toc-sidebar {
  z-index: 10;
}

.content-section {
  scroll-margin-top: 100px;
}

.usage-card, .measure-item, .right-item {
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  height: 100%;
  background: white;
}

.usage-icon, .measure-icon {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.measure-item {
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
}

.measure-icon {
  margin-right: 1rem;
  margin-top: 0.25rem;
}

.measure-content {
  flex: 1;
}

.rights-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.right-item {
  text-align: center;
  padding: 2rem 1rem;
}

.right-item i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.contact-info {
  background: #f8f9fa;
  padding: 2rem;
  border-radius: 0.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.contact-item:last-child {
  margin-bottom: 0;
}

.contact-item i {
  width: 20px;
  margin-right: 1rem;
}

@media (max-width: 992px) {
  .toc-sidebar {
    position: static !important;
  }
  
  .rights-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
}

@media (max-width: 768px) {
  .usage-card, .right-item {
    padding: 1rem;
  }
  
  .measure-item {
    flex-direction: column;
    text-align: center;
  }
  
  .measure-icon {
    margin-right: 0;
    margin-bottom: 1rem;
  }
}
</style>