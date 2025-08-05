<template>
  <div class="terms-page">
    <!-- Page Header -->
    <div class="page-header bg-warning text-dark py-5 mb-5">
      <div class="container">
        <div class="row" style="align-items: center;">
          <div class="col-md-8">
            <h1 class="display-4 fw-bold mb-3">Điều khoản sử dụng</h1>
            <p class="lead">
              Quy định và điều khoản khi sử dụng dịch vụ thư viện
            </p>
          </div>
          <div class="col-md-4 text-center">
            <i class="fas fa-file-contract fa-5x opacity-75"></i>
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
          <div class="terms-content">
            <!-- Introduction -->
            <section id="introduction" class="content-section mb-5">
              <h2>1. Giới thiệu</h2>
              <p>
                Chào mừng bạn đến với Hệ thống Thư viện Điện tử. Bằng cách truy cập 
                và sử dụng dịch vụ của chúng tôi, bạn đồng ý tuân thủ các điều khoản 
                và điều kiện được nêu trong tài liệu này.
              </p>
              <p>
                Vui lòng đọc kỹ các điều khoản này trước khi sử dụng dịch vụ. 
                Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng không sử dụng dịch vụ.
              </p>
              <div class="alert alert-info">
                <i class="fas fa-info-circle me-2"></i>
                <strong>Có hiệu lực từ:</strong> {{ effectiveDate }}
              </div>
            </section>

            <!-- Definitions -->
            <section id="definitions" class="content-section mb-5">
              <h2>2. Định nghĩa</h2>
              <div class="definitions-list">
                <div class="definition-item">
                  <h5>"Thư viện"</h5>
                  <p>Đề cập đến Hệ thống Thư viện Điện tử và tất cả các dịch vụ liên quan.</p>
                </div>
                <div class="definition-item">
                  <h5>"Người dùng" hoặc "Bạn"</h5>
                  <p>Đề cập đến bất kỳ cá nhân nào truy cập hoặc sử dụng dịch vụ của chúng tôi.</p>
                </div>
                <div class="definition-item">
                  <h5>"Tài khoản"</h5>
                  <p>Tài khoản cá nhân được tạo để truy cập các dịch vụ của thư viện.</p>
                </div>
                <div class="definition-item">
                  <h5>"Nội dung"</h5>
                  <p>Bao gồm sách, tài liệu, thông tin và dữ liệu có sẵn trên hệ thống.</p>
                </div>
              </div>
            </section>

            <!-- Account Registration -->
            <section id="registration" class="content-section mb-5">
              <h2>3. Đăng ký tài khoản</h2>
              
              <h4>3.1. Điều kiện đăng ký</h4>
              <ul>
                <li>Bạn phải từ 16 tuổi trở lên để đăng ký tài khoản</li>
                <li>Cung cấp thông tin chính xác và đầy đủ</li>
                <li>Có CMND/CCCD hợp lệ để xác thực danh tính</li>
                <li>Đồng ý tuân thủ các quy định của thư viện</li>
              </ul>

              <h4>3.2. Trách nhiệm tài khoản</h4>
              <div class="responsibility-cards">
                <div class="card border-0 shadow-sm mb-3">
                  <div class="card-body">
                    <h6><i class="fas fa-lock text-primary me-2"></i>Bảo mật tài khoản</h6>
                    <p class="mb-0">Bạn có trách nhiệm bảo vệ mật khẩu và thông tin đăng nhập.</p>
                  </div>
                </div>
                <div class="card border-0 shadow-sm mb-3">
                  <div class="card-body">
                    <h6><i class="fas fa-user-check text-success me-2"></i>Thông tin chính xác</h6>
                    <p class="mb-0">Cập nhật thông tin cá nhân khi có thay đổi.</p>
                  </div>
                </div>
                <div class="card border-0 shadow-sm">
                  <div class="card-body">
                    <h6><i class="fas fa-exclamation-triangle text-warning me-2"></i>Báo cáo vi phạm</h6>
                    <p class="mb-0">Thông báo ngay khi phát hiện tài khoản bị xâm nhập.</p>
                  </div>
                </div>
              </div>
            </section>

            <!-- Library Services -->
            <section id="services" class="content-section mb-5">
              <h2>4. Dịch vụ thư viện</h2>
              
              <h4>4.1. Dịch vụ mượn sách</h4>
              <div class="service-rules">
                <div class="rule-item">
                  <i class="fas fa-book text-primary"></i>
                  <div>
                    <h6>Số lượng mượn</h6>
                    <p>Tối đa 5 cuốn sách cùng một lúc</p>
                  </div>
                </div>
                <div class="rule-item">
                  <i class="fas fa-calendar text-success"></i>
                  <div>
                    <h6>Thời gian mượn</h6>
                    <p>14 ngày, có thể gia hạn thêm 7 ngày</p>
                  </div>
                </div>
                <div class="rule-item">
                  <i class="fas fa-money-bill text-warning"></i>
                  <div>
                    <h6>Phí phạt</h6>
                    <p>2,000 VNĐ/ngày cho mỗi sách trả muộn</p>
                  </div>
                </div>
              </div>

              <h4>4.2. Quy định sử dụng</h4>
              <div class="alert alert-warning">
                <h6><i class="fas fa-exclamation-triangle me-2"></i>Nghiêm cấm</h6>
                <ul class="mb-0">
                  <li>Làm hỏng, mất sách</li>
                  <li>Cho người khác mượn sách bằng tài khoản của bạn</li>
                  <li>Sao chép, phân phối nội dung trái phép</li>
                  <li>Sử dụng dịch vụ cho mục đích thương mại</li>
                </ul>
              </div>
            </section>

            <!-- User Conduct -->
            <section id="conduct" class="content-section mb-5">
              <h2>5. Quy tắc ứng xử</h2>
              
              <div class="conduct-section">
                <h4>5.1. Hành vi được khuyến khích</h4>
                <div class="conduct-grid positive">
                  <div class="conduct-item">
                    <i class="fas fa-thumbs-up text-success"></i>
                    <span>Sử dụng dịch vụ đúng mục đích</span>
                  </div>
                  <div class="conduct-item">
                    <i class="fas fa-heart text-success"></i>
                    <span>Tôn trọng tài sản thư viện</span>
                  </div>
                  <div class="conduct-item">
                    <i class="fas fa-handshake text-success"></i>
                    <span>Hợp tác với nhân viên thư viện</span>
                  </div>
                  <div class="conduct-item">
                    <i class="fas fa-share-alt text-success"></i>
                    <span>Chia sẻ phản hồi tích cực</span>
                  </div>
                </div>

                <h4>5.2. Hành vi bị cấm</h4>
                <div class="conduct-grid negative">
                  <div class="conduct-item">
                    <i class="fas fa-ban text-danger"></i>
                    <span>Vi phạm bản quyền</span>
                  </div>
                  <div class="conduct-item">
                    <i class="fas fa-virus text-danger"></i>
                    <span>Tải lên malware</span>
                  </div>
                  <div class="conduct-item">
                    <i class="fas fa-user-times text-danger"></i>
                    <span>Quấy rối người khác</span>
                  </div>
                  <div class="conduct-item">
                    <i class="fas fa-exclamation-triangle text-danger"></i>
                    <span>Cung cấp thông tin sai</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Intellectual Property -->
            <section id="intellectual-property" class="content-section mb-5">
              <h2>6. Quyền sở hữu trí tuệ</h2>
              
              <div class="ip-section">
                <h4>6.1. Quyền của thư viện</h4>
                <p>
                  Tất cả nội dung, thiết kế, logo, và phần mềm của hệ thống thuộc 
                  quyền sở hữu của thư viện hoặc được cấp phép sử dụng hợp pháp.
                </p>

                <h4>6.2. Quyền của người dùng</h4>
                <p>
                  Bạn được cấp quyền sử dụng có giới hạn, không độc quyền để truy cập 
                  và sử dụng dịch vụ cho mục đích cá nhân, phi thương mại.
                </p>

                <div class="alert alert-info">
                  <i class="fas fa-info-circle me-2"></i>
                  Việc sử dụng nội dung phải tuân thủ luật bản quyền và các quy định liên quan.
                </div>
              </div>
            </section>

            <!-- Liability -->
            <section id="liability" class="content-section mb-5">
              <h2>7. Trách nhiệm pháp lý</h2>
              
              <h4>7.1. Giới hạn trách nhiệm</h4>
              <p>
                Thư viện không chịu trách nhiệm cho các thiệt hại gián tiếp, 
                ngẫu nhiên hoặc hậu quả phát sinh từ việc sử dụng dịch vụ.
              </p>

              <h4>7.2. Tuyên bố từ chối</h4>
              <div class="disclaimer-box">
                <p>
                  Dịch vụ được cung cấp "như hiện tại" mà không có bất kỳ bảo đảm nào. 
                  Chúng tôi không đảm bảo rằng dịch vụ sẽ không bị gián đoạn hoặc không có lỗi.
                </p>
              </div>
            </section>

            <!-- Termination -->
            <section id="termination" class="content-section mb-5">
              <h2>8. Chấm dứt dịch vụ</h2>
              
              <h4>8.1. Chấm dứt bởi người dùng</h4>
              <p>Bạn có thể chấm dứt tài khoản bất cứ lúc nào bằng cách liên hệ với chúng tôi.</p>

              <h4>8.2. Chấm dứt bởi thư viện</h4>
              <p>Chúng tôi có quyền chấm dứt tài khoản của bạn nếu:</p>
              <ul>
                <li>Vi phạm các điều khoản sử dụng</li>
                <li>Không thanh toán phí phạt</li>
                <li>Cung cấp thông tin sai lệch</li>
                <li>Có hành vi gây tổn hại đến hệ thống</li>
              </ul>
            </section>

            <!-- Changes -->
            <section id="changes" class="content-section mb-5">
              <h2>9. Thay đổi điều khoản</h2>
              <p>
                Chúng tôi có quyền cập nhật các điều khoản này bất cứ lúc nào. 
                Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên website.
              </p>
              <div class="alert alert-warning">
                <i class="fas fa-bell me-2"></i>
                Bạn sẽ được thông báo về các thay đổi quan trọng qua email đã đăng ký.
              </div>
            </section>

            <!-- Contact -->
            <section id="contact" class="content-section mb-5">
              <h2>10. Liên hệ</h2>
              <p>
                Nếu bạn có câu hỏi về các điều khoản này, vui lòng liên hệ:
              </p>
              
              <div class="contact-info">
                <div class="contact-item">
                  <i class="fas fa-envelope text-primary"></i>
                  <span>Email: legal@library.com</span>
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

          <!-- Acceptance -->
          <div class="acceptance-section mt-5">
            <div class="card border-0 shadow-sm bg-light">
              <div class="card-body text-center py-4">
                <h5 class="mb-3">Chấp nhận điều khoản</h5>
                <p class="text-muted mb-4">
                  Bằng cách tiếp tục sử dụng dịch vụ, bạn xác nhận đã đọc, 
                  hiểu và đồng ý với tất cả các điều khoản trên.
                </p>
                <div class="d-flex gap-3 justify-content-center flex-wrap">
                  <router-link to="/register" class="btn btn-primary">
                    <i class="fas fa-user-plus me-2"></i>
                    Đăng ký tài khoản
                  </router-link>
                  <router-link to="/contact" class="btn btn-outline-primary">
                    <i class="fas fa-question-circle me-2"></i>
                    Có câu hỏi?
                  </router-link>
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
  name: 'Terms',
  setup() {
    const effectiveDate = ref('01/01/2024')
    
    const sections = ref([
      { id: 'introduction', title: '1. Giới thiệu' },
      { id: 'definitions', title: '2. Định nghĩa' },
      { id: 'registration', title: '3. Đăng ký tài khoản' },
      { id: 'services', title: '4. Dịch vụ thư viện' },
      { id: 'conduct', title: '5. Quy tắc ứng xử' },
      { id: 'intellectual-property', title: '6. Quyền sở hữu trí tuệ' },
      { id: 'liability', title: '7. Trách nhiệm pháp lý' },
      { id: 'termination', title: '8. Chấm dứt dịch vụ' },
      { id: 'changes', title: '9. Thay đổi điều khoản' },
      { id: 'contact', title: '10. Liên hệ' }
    ])

    const scrollToSection = (sectionId) => {
      const element = document.getElementById(sectionId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' })
      }
    }

    return {
      effectiveDate,
      sections,
      scrollToSection
    }
  }
}
</script>

<style>
@import '@/assets/styles/pages/static-pages.css';

/* Terms specific styles */
.toc-sidebar {
  z-index: 10;
}

.content-section {
  scroll-margin-top: 100px;
}

.definitions-list .definition-item {
  padding: 1.5rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  margin-bottom: 1rem;
  background: white;
}

.definition-item h5 {
  color: #0d6efd;
  margin-bottom: 0.5rem;
}

.responsibility-cards .card {
  transition: transform 0.2s ease;
}

.responsibility-cards .card:hover {
  transform: translateX(5px);
}

.service-rules {
  display: grid;
  gap: 1rem;
  margin-bottom: 2rem;
}

.rule-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border: 1px solid #e9ecef;
  border-radius: 0.5rem;
  background: white;
}

.rule-item i {
  font-size: 1.5rem;
  margin-right: 1rem;
  width: 30px;
  text-align: center;
}

.conduct-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.conduct-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 0.5rem;
  background: white;
  border: 1px solid #e9ecef;
}

.conduct-grid.positive .conduct-item {
  border-left: 4px solid #198754;
}

.conduct-grid.negative .conduct-item {
  border-left: 4px solid #dc3545;
}

.conduct-item i {
  margin-right: 0.75rem;
  font-size: 1.2rem;
}

.disclaimer-box {
  background: #f8f9fa;
  border-left: 4px solid #ffc107;
  padding: 1.5rem;
  border-radius: 0.25rem;
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
  
  .conduct-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .definition-item, .rule-item, .conduct-item {
    padding: 1rem;
  }
  
  .rule-item {
    flex-direction: column;
    text-align: center;
  }
  
  .rule-item i {
    margin-right: 0;
    margin-bottom: 0.5rem;
  }
}
</style>