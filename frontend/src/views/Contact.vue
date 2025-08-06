<template>
  <div class="contact-page">
    <!-- Page Header (improved, đồng bộ BooksList) -->
    <div class="page-header bg-primary text-white py-5 mb-5 rounded-3 shadow-sm">
      <div class="container">
        <div class="row align-items-center">
          <div class="col-md-8">
            <h1 class="display-4 fw-bold mb-3">
              <i class="fas fa-phone-alt fa-lg me-2"></i>
              Liên hệ với chúng tôi
            </h1>
            <p class="lead mb-0 opacity-75">Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn</p>
          </div>
          <div class="col-md-4 text-center text-md-end mt-4 mt-md-0">
            <i class="fas fa-phone-alt fa-4x opacity-75"></i>
          </div>
        </div>
      </div>
    </div>

    <div class="container">
      <div class="row">
        <!-- Contact Form -->
        <div class="col-lg-8 mb-5">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0 py-4">
              <h3 class="mb-0">
                <i class="fas fa-envelope text-primary me-2"></i>
                Gửi tin nhắn cho chúng tôi
              </h3>
            </div>
            <div class="card-body p-4">
              <form @submit.prevent="submitForm">
                <div class="row g-3">
                  <div class="col-md-6">
                    <label for="name" class="form-label">Họ và tên *</label>
                    <input type="text" class="form-control" id="name" v-model="form.name"
                      :class="{ 'is-invalid': errors.name }" required>
                    <div v-if="errors.name" class="invalid-feedback">
                      {{ errors.name }}
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label for="email" class="form-label">Email *</label>
                    <input type="email" class="form-control" id="email" v-model="form.email"
                      :class="{ 'is-invalid': errors.email }" required>
                    <div v-if="errors.email" class="invalid-feedback">
                      {{ errors.email }}
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label for="phone" class="form-label">Số điện thoại</label>
                    <input type="tel" class="form-control" id="phone" v-model="form.phone"
                      :class="{ 'is-invalid': errors.phone }">
                    <div v-if="errors.phone" class="invalid-feedback">
                      {{ errors.phone }}
                    </div>
                  </div>
                  <div class="col-md-6">
                    <label for="subject" class="form-label">Chủ đề *</label>
                    <select class="form-select" id="subject" v-model="form.subject"
                      :class="{ 'is-invalid': errors.subject }" required>
                      <option value="">Chọn chủ đề</option>
                      <option value="general">Thông tin chung</option>
                      <option value="borrow">Mượn trả sách</option>
                      <option value="account">Tài khoản</option>
                      <option value="technical">Hỗ trợ kỹ thuật</option>
                      <option value="suggestion">Góp ý</option>
                      <option value="other">Khác</option>
                    </select>
                    <div v-if="errors.subject" class="invalid-feedback">
                      {{ errors.subject }}
                    </div>
                  </div>
                  <div class="col-12">
                    <label for="message" class="form-label">Nội dung tin nhắn *</label>
                    <textarea class="form-control" id="message" rows="5" v-model="form.message"
                      :class="{ 'is-invalid': errors.message }" placeholder="Nhập nội dung tin nhắn của bạn..."
                      required></textarea>
                    <div v-if="errors.message" class="invalid-feedback">
                      {{ errors.message }}
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-content-between align-items-center mt-4">
                  <small class="text-muted">* Trường bắt buộc</small>
                  <div>
                    <button type="button" class="btn btn-outline-secondary me-2" @click="resetForm">
                      <i class="fas fa-undo me-1"></i>
                      Đặt lại
                    </button>
                    <button type="submit" class="btn btn-primary" :disabled="submitting">
                      <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                      <i v-else class="fas fa-paper-plane me-1"></i>
                      {{ submitting ? 'Đang gửi...' : 'Gửi tin nhắn' }}
                    </button>
                  </div>
                </div>
              </form>

              <!-- Success Message -->
              <div v-if="showSuccess" class="alert alert-success mt-4">
                <i class="fas fa-check-circle me-2"></i>
                Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi trong vòng 24 giờ.
              </div>
            </div>
          </div>
        </div>

        <!-- Contact Info -->
        <div class="col-lg-4">
          <!-- Contact Details -->
          <div class="card border-0 shadow-sm mb-4">
            <div class="card-header bg-white border-0 py-4">
              <h5 class="mb-0">
                <i class="fas fa-map-marker-alt text-primary me-2"></i>
                Thông tin liên hệ
              </h5>
            </div>
            <div class="card-body p-4">
              <div class="contact-item mb-4">
                <div class="d-flex align-items-start">
                  <div class="contact-icon me-3">
                    <i class="fas fa-map-marker-alt text-primary"></i>
                  </div>
                  <div>
                    <h6>Địa chỉ</h6>
                    <p class="text-muted mb-0">
                      8 Đường B10, Khu dân cư 91B<br>
                      Cần Thơ, Việt Nam
                    </p>
                  </div>
                </div>
              </div>

              <div class="contact-item mb-4">
                <div class="d-flex align-items-start">
                  <div class="contact-icon me-3">
                    <i class="fas fa-phone text-success"></i>
                  </div>
                  <div>
                    <h6>Điện thoại</h6>
                    <p class="text-muted mb-0">
                      <a href="tel:+84123456789" class="text-decoration-none">
                        (84) 123 456 789
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div class="contact-item mb-4">
                <div class="d-flex align-items-start">
                  <div class="contact-icon me-3">
                    <i class="fas fa-envelope text-info"></i>
                  </div>
                  <div>
                    <h6>Email</h6>
                    <p class="text-muted mb-0">
                      <a href="mailto:danhb2205857@student.ctu.edu.vn" class="text-decoration-none">
                        danhb2205857@student.ctu.edu.vn
                      </a>
                    </p>
                  </div>
                </div>
              </div>

              <div class="contact-item">
                <div class="d-flex align-items-start">
                  <div class="contact-icon me-3">
                    <i class="fas fa-clock text-warning"></i>
                  </div>
                  <div>
                    <h6>Giờ làm việc</h6>
                    <p class="text-muted mb-1">Thứ 2 - Thứ 6: 8:00 - 17:00</p>
                    <p class="text-muted mb-0">Thứ 7: 8:00 - 12:00</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- FAQ -->
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0 py-4">
              <h5 class="mb-0">
                <i class="fas fa-question-circle text-primary me-2"></i>
                Câu hỏi thường gặp
              </h5>
            </div>
            <div class="card-body p-4">
              <div class="accordion" id="faqAccordion">
                <div class="accordion-item border-0 mb-2">
                  <h6 class="accordion-header">
                    <button class="accordion-button collapsed bg-light border-0 rounded" type="button"
                      data-bs-toggle="collapse" data-bs-target="#faq1">
                      Làm thế nào để đăng ký thành viên?
                    </button>
                  </h6>
                  <div id="faq1" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div class="accordion-body pt-2">
                      Bạn có thể đăng ký trực tuyến hoặc đến trực tiếp thư viện với CMND/CCCD.
                    </div>
                  </div>
                </div>

                <div class="accordion-item border-0 mb-2">
                  <h6 class="accordion-header">
                    <button class="accordion-button collapsed bg-light border-0 rounded" type="button"
                      data-bs-toggle="collapse" data-bs-target="#faq2">
                      Thời gian mượn sách là bao lâu?
                    </button>
                  </h6>
                  <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div class="accordion-body pt-2">
                      Thời gian mượn sách tiêu chuẩn là 14 ngày, có thể gia hạn thêm 7 ngày.
                    </div>
                  </div>
                </div>

                <div class="accordion-item border-0">
                  <h6 class="accordion-header">
                    <button class="accordion-button collapsed bg-light border-0 rounded" type="button"
                      data-bs-toggle="collapse" data-bs-target="#faq3">
                      Có phí phạt khi trả sách muộn không?
                    </button>
                  </h6>
                  <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div class="accordion-body pt-2">
                      Có, phí phạt là 2,000 VNĐ/ngày cho mỗi cuốn sách trả muộn.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Map Section -->
      <div class="row mt-5">
        <div class="col-12">
          <div class="card border-0 shadow-sm">
            <div class="card-header bg-white border-0 py-4">
              <h5 class="mb-0">
                <i class="fas fa-map text-primary me-2"></i>
                Vị trí thư viện
              </h5>
            </div>
            <div class="card-body p-0">
              <div class="map-placeholder bg-light d-flex align-items-center justify-content-center"
                style="height: 400px;">
                <img src="/images/map.jpg" alt="địa chỉ thư viện" class="img-fluid" style="height: 400px; width: 100%;;">
              </div>
            </div>
          </div>
        </div>
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
import { ref } from 'vue'

export default {
  name: 'Contact',
  setup() {
    const form = ref({
      name: '',
      email: '',
      phone: '',
      subject: '',
      message: ''
    })

    const errors = ref({})
    const submitting = ref(false)
    const showSuccess = ref(false)

    const validateForm = () => {
      errors.value = {}

      if (!form.value.name.trim()) {
        errors.value.name = 'Vui lòng nhập họ tên'
      }

      if (!form.value.email.trim()) {
        errors.value.email = 'Vui lòng nhập email'
      } else if (!/\S+@\S+\.\S+/.test(form.value.email)) {
        errors.value.email = 'Email không hợp lệ'
      }

      if (form.value.phone && !/^[0-9+\-\s()]+$/.test(form.value.phone)) {
        errors.value.phone = 'Số điện thoại không hợp lệ'
      }

      if (!form.value.subject) {
        errors.value.subject = 'Vui lòng chọn chủ đề'
      }

      if (!form.value.message.trim()) {
        errors.value.message = 'Vui lòng nhập nội dung tin nhắn'
      } else if (form.value.message.trim().length < 10) {
        errors.value.message = 'Nội dung tin nhắn quá ngắn (tối thiểu 10 ký tự)'
      }

      return Object.keys(errors.value).length === 0
    }

    const submitForm = async () => {
      if (!validateForm()) {
        return
      }

      submitting.value = true

      try {
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000))

        // In real app, send to API
        // await axios.post('/api/contact', form.value)

        showSuccess.value = true
        resetForm()

        // Hide success message after 5 seconds
        setTimeout(() => {
          showSuccess.value = false
        }, 5000)

      } catch (error) {
        console.error('Error submitting form:', error)
        alert('Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại!')
      } finally {
        submitting.value = false
      }
    }

    const resetForm = () => {
      form.value = {
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      }
      errors.value = {}
    }

    return {
      form,
      errors,
      submitting,
      showSuccess,
      submitForm,
      resetForm
    }
  }
}
</script>

<style>
@import '@/assets/styles/pages/static-pages.css';

/* Contact specific styles */
.contact-item {
  padding-bottom: 1rem;
  border-bottom: 1px solid #f8f9fa;
}

.contact-item:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.contact-icon {
  width: 20px;
  text-align: center;
}

.accordion-button {
  font-size: 0.9rem;
  padding: 0.75rem 1rem;
}

.accordion-button:not(.collapsed) {
  background-color: #e7f3ff;
  color: #0d6efd;
}

.accordion-body {
  font-size: 0.875rem;
  color: #6c757d;
}

.map-placeholder {
  border-radius: 0 0 0.5rem 0.5rem;
}

@media (max-width: 768px) {
  .page-header .display-4 {
    font-size: 2rem;
  }

  .contact-item {
    margin-bottom: 1.5rem;
  }
}
</style>