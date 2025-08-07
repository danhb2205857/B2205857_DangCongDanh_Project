<template>
  <div class="register-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-8 col-lg-7">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <!-- Header -->
              <div class="text-center mb-4">
                <img src="/images/logo.png" alt="Logo" class="logo mb-3" @error="handleLogoError">
                <h2 class="fw-bold text-primary">Đăng ký tài khoản</h2>
                <p class="text-muted">Tạo tài khoản độc giả hoặc nhân viên mới</p>
              </div>

              <!-- Chọn loại đăng ký -->
              <div class="mb-4 d-flex justify-content-center gap-3">
                <button type="button" class="btn btn-outline-primary" :class="{ active: registerType === 'reader' }"
                  @click="registerType = 'reader'">Độc giả</button>
                <button type="button" class="btn btn-outline-success" :class="{ active: registerType === 'staff' }"
                  @click="registerType = 'staff'">Nhân viên</button>
              </div>

              <!-- Registration Form -->
              <form @submit.prevent="handleRegister">
                <!-- Form cho Độc giả -->
                <div v-if="registerType === 'reader'">
                  <div class="row">
                    <!-- Email -->
                    <div class="col-md-12 mb-3">
                      <label for="email" class="form-label">Email <span class="text-danger">*</span></label>
                      <div class="input-group">
                        <span class="input-group-text">
                          <i class="fas fa-envelope"></i>
                        </span>
                        <input v-model="form.email" type="email" class="form-control" id="email"
                          placeholder="example@email.com" required :disabled="loading">
                      </div>
                      <small class="text-muted">Mã độc giả sẽ được tự động tạo khi đăng ký</small>
                    </div>
                  </div>
                </div>

                <!-- Form cho Nhân viên -->
                <div v-if="registerType === 'staff'">
                  <div class="row">
                    <!-- Email -->
                    <div class="col-md-12 mb-3">
                      <label for="staffEmail" class="form-label">Email</label>
                      <div class="input-group">
                        <span class="input-group-text">
                          <i class="fas fa-envelope"></i>
                        </span>
                        <input v-model="form.email" type="email" class="form-control" id="staffEmail"
                          placeholder="nhanvien@email.com" :disabled="loading">
                      </div>
                      <small class="text-muted">Mã nhân viên sẽ được tự động tạo khi đăng ký</small>
                    </div>
                  </div>
                </div>

                <!-- Form chung cho cả độc giả và nhân viên -->
                <div class="row">
                  <!-- Họ tên cho độc giả -->
                  <div v-if="registerType === 'reader'" class="col-md-6 mb-3">
                    <label for="hoLot" class="form-label">Họ lót <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="fas fa-user"></i>
                      </span>
                      <input v-model="form.HoLot" type="text" class="form-control" id="hoLot" placeholder="Nguyễn Văn"
                        maxlength="50" required :disabled="loading">
                    </div>
                  </div>

                  <div v-if="registerType === 'reader'" class="col-md-6 mb-3">
                    <label for="ten" class="form-label">Tên <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="fas fa-user"></i>
                      </span>
                      <input v-model="form.Ten" type="text" class="form-control" id="ten" placeholder="An"
                        maxlength="20" required :disabled="loading">
                    </div>
                  </div>

                  <!-- Họ tên đầy đủ cho nhân viên -->
                  <div v-if="registerType === 'staff'" class="col-md-12 mb-3">
                    <label for="fullName" class="form-label">Họ tên đầy đủ <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="fas fa-user"></i>
                      </span>
                      <input v-model="form.fullName" type="text" class="form-control" id="fullName"
                        placeholder="Nguyễn Văn An" maxlength="100" required :disabled="loading">
                    </div>
                  </div>
                </div>

                <div class="row">
                  <!-- Ngày sinh -->
                  <div class="col-md-6 mb-3">
                    <label for="ngaySinh" class="form-label">Ngày sinh <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="fas fa-calendar"></i>
                      </span>
                      <input v-model="form.NgaySinh" type="date" class="form-control" id="ngaySinh" :max="maxDate"
                        :min="minDate" required :disabled="loading">
                    </div>
                  </div>

                  <!-- Phái cho độc giả / Chức vụ cho nhân viên -->
                  <div class="col-md-6 mb-3">
                    <label v-if="registerType === 'reader'" for="phai" class="form-label">Giới tính <span
                        class="text-danger">*</span></label>
                    <label v-if="registerType === 'staff'" for="chucVu" class="form-label">Chức vụ <span
                        class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text">
                        <i v-if="registerType === 'reader'" class="fas fa-venus-mars"></i>
                        <i v-if="registerType === 'staff'" class="fas fa-user-tie"></i>
                      </span>
                      <!-- Select cho độc giả -->
                      <select v-if="registerType === 'reader'" v-model="form.Phai" class="form-select" id="phai"
                        required :disabled="loading">
                        <option value="">Chọn giới tính</option>
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                      <!-- Select cho nhân viên -->
                      <select v-if="registerType === 'staff'" v-model="form.chucVu" class="form-select" id="chucVu"
                        required :disabled="loading">
                        <option value="">Chọn chức vụ</option>
                        <option value="Thủ thư">Thủ thư</option>
                        <option value="Nhân viên">Nhân viên</option>
                        <option value="Thực tập sinh">Thực tập sinh</option>
                      </select>
                    </div>
                  </div>
                </div>

                <!-- Địa chỉ -->
                <div class="mb-3">
                  <label for="diaChi" class="form-label">Địa chỉ <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="fas fa-map-marker-alt"></i>
                    </span>
                    <textarea v-model="form.DiaChi" class="form-control" id="diaChi" rows="2"
                      placeholder="Nhập địa chỉ đầy đủ" maxlength="200" required :disabled="loading"></textarea>
                  </div>
                </div>

                <!-- Điện thoại -->
                <div class="mb-3">
                  <label for="dienThoai" class="form-label">Số điện thoại <span class="text-danger">*</span></label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="fas fa-phone"></i>
                    </span>
                    <!-- Input cho độc giả -->
                    <input v-if="registerType === 'reader'" v-model="form.DienThoai" type="tel" class="form-control"
                      id="dienThoai" placeholder="0901234567" pattern="^(0|\+84)[0-9]{9,10}$"
                      title="Số điện thoại không hợp lệ" required :disabled="loading">
                    <!-- Input cho nhân viên -->
                    <input v-else v-model="form.phone" type="tel" class="form-control" id="dienThoai"
                      placeholder="0901234567" pattern="^(0|\+84)[0-9]{9,10}$" title="Số điện thoại không hợp lệ"
                      required :disabled="loading">
                  </div>
                </div>

                <div class="row">
                  <!-- Mật khẩu -->
                  <div class="col-md-6 mb-3">
                    <label for="password" class="form-label">Mật khẩu <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="fas fa-lock"></i>
                      </span>
                      <input v-model="form.password" :type="showPassword ? 'text' : 'password'" class="form-control"
                        id="password" placeholder="Tối thiểu 6 ký tự" minlength="6" required :disabled="loading">
                      <button type="button" class="btn btn-outline-secondary" @click="showPassword = !showPassword"
                        :disabled="loading">
                        <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                    </div>
                  </div>

                  <!-- Xác nhận mật khẩu -->
                  <div class="col-md-6 mb-3">
                    <label for="confirmPassword" class="form-label">Xác nhận mật khẩu <span
                        class="text-danger">*</span></label>
                    <div class="input-group">
                      <span class="input-group-text">
                        <i class="fas fa-lock"></i>
                      </span>
                      <input v-model="form.confirmPassword" :type="showConfirmPassword ? 'text' : 'password'"
                        class="form-control" id="confirmPassword" placeholder="Nhập lại mật khẩu" required
                        :disabled="loading">
                      <button type="button" class="btn btn-outline-secondary"
                        @click="showConfirmPassword = !showConfirmPassword" :disabled="loading">
                        <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Terms checkbox -->
                <div class="mb-3 form-check">
                  <input v-model="form.acceptTerms" type="checkbox" class="form-check-input" id="acceptTerms" required
                    :disabled="loading">
                  <label class="form-check-label" for="acceptTerms">
                    Tôi đồng ý với <a href="#" class="text-decoration-none">điều khoản sử dụng</a> và <a href="#"
                      class="text-decoration-none">chính sách bảo mật</a>
                  </label>
                </div>

                <!-- Error Message -->
                <div v-if="error" class="alert alert-danger" role="alert">
                  <i class="fas fa-exclamation-circle me-2"></i>
                  {{ error }}
                </div>

                <!-- Submit Button -->
                <button type="submit" class="btn btn-primary w-100 py-2 mb-3" :disabled="loading || !isFormValid">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  <i v-else class="fas fa-user-plus me-2"></i>
                  {{ loading ? 'Đang đăng ký...' : 'Đăng ký' }}
                </button>

                <!-- Links -->
                <div class="text-center">
                  <p class="mb-0">
                    Đã có tài khoản?
                    <router-link to="/login" class="text-decoration-none fw-bold">
                      Đăng nhập ngay
                    </router-link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          <!-- Back to Home -->
          <div class="text-center mt-3">
            <router-link to="/" class="text-decoration-none text-white">
              <i class="fas fa-arrow-left me-2"></i>
              Về trang chủ
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

export default {
  name: 'Register',
  setup() {
    const router = useRouter()
    const { register, isAuthenticated } = useAuth()

    const registerType = ref('reader') // 'reader' hoặc 'staff'

    const form = ref({
      // Common fields
      email: '',
      NgaySinh: '',
      DiaChi: '',
      password: '',
      confirmPassword: '',
      acceptTerms: false,

      // Reader fields
      HoLot: '',
      Ten: '',
      Phai: '',
      DienThoai: '',

      // Staff fields
      fullName: '',
      phone: '',
      chucVu: ''
    })

    const loading = ref(false)
    const error = ref('')
    const showPassword = ref(false)
    const showConfirmPassword = ref(false)

    // Date constraints
    const today = new Date()
    const maxDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate()).toISOString().split('T')[0]
    const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate()).toISOString().split('T')[0]

    // Form validation
    const isFormValid = computed(() => {
      return form.value.password === form.value.confirmPassword &&
        form.value.password.length >= 6 &&
        form.value.acceptTerms
    })

    // Redirect if already authenticated
    onMounted(() => {
      if (isAuthenticated.value) {
        router.push('/')
      }
    })

    const handleRegister = async () => {
      if (loading.value || !isFormValid.value) return

      if (form.value.password !== form.value.confirmPassword) {
        error.value = 'Mật khẩu xác nhận không khớp'
        return
      }

      loading.value = true
      error.value = ''

      try {
        let result

        if (registerType.value === 'reader') {
          // Đăng ký độc giả - không cần gửi MaDocGia, backend sẽ tự tạo
          const userData = {
            email: form.value.email,
            HoLot: form.value.HoLot,
            Ten: form.value.Ten,
            NgaySinh: form.value.NgaySinh,
            Phai: form.value.Phai,
            DiaChi: form.value.DiaChi,
            DienThoai: form.value.DienThoai,
            password: form.value.password
          }
          result = await register(userData)
        } else {
          // Đăng ký nhân viên - không cần gửi username, backend sẽ tự tạo MSNV
          const staffData = {
            fullName: form.value.fullName,
            password: form.value.password,
            email: form.value.email,
            phone: form.value.phone,
            address: form.value.DiaChi,
            birthDate: form.value.NgaySinh
          }

          // Call staff registration API directly
          const response = await fetch('/auth/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(staffData)
          })

          const data = await response.json()

          if (data.success) {
            // Save token and user info
            localStorage.setItem('token', data.data.token)
            localStorage.setItem('user', JSON.stringify(data.data.user))
            localStorage.setItem('userRole', 'staff')
            result = { success: true }
          } else {
            result = { success: false, error: data.message }
          }
        }

        if (result.success) {
          // Show success message
          window.dispatchEvent(new CustomEvent('show-message', {
            detail: {
              message: 'Đăng ký tài khoản thành công!',
              type: 'success'
            }
          }))

          // Redirect based on registration type
          const redirectTo = registerType.value === 'staff' ? '/admin' : '/'
          router.push(redirectTo)
        } else {
          error.value = result.error || 'Đăng ký thất bại'
        }
      } catch (err) {
        console.error('Registration error:', err)
        error.value = 'Có lỗi xảy ra, vui lòng thử lại'
      } finally {
        loading.value = false
      }
    }

    const handleLogoError = (event) => {
      event.target.style.display = 'none'
    }

    return {
      registerType,
      form,
      loading,
      error,
      showPassword,
      showConfirmPassword,
      maxDate,
      minDate,
      isFormValid,
      handleRegister,
      handleLogoError
    }
  }
}
</script>

<style scoped>
.register-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  padding: 2rem 0;
}

.card {
  border-radius: 1rem;
  backdrop-filter: blur(10px);
}

.logo {
  width: 80px;
  height: 80px;
  object-fit: contain;
}

.input-group-text {
  background-color: #f8f9fa;
  border-right: none;
}

.form-control,
.form-select {
  border-left: none;
}

.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

.btn-primary {
  background: linear-gradient(45deg, #0d6efd, #6610f2);
  border: none;
  border-radius: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.4);
}

.btn-primary:disabled {
  transform: none;
  box-shadow: none;
}

/* Button styling cho loại đăng ký */
.btn-outline-primary {
  border-width: 2px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-outline-primary:hover {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.3);
}

.btn-outline-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(13, 110, 253, 0.4);
}

.btn-outline-primary.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
  color: white;
  box-shadow: 0 3px 8px rgba(13, 110, 253, 0.3);
}

.btn-outline-success {
  border-width: 2px;
  font-weight: 500;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.btn-outline-success:hover {
  background-color: #198754;
  border-color: #198754;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(25, 135, 84, 0.3);
}

.btn-outline-success:active {
  transform: translateY(0);
  box-shadow: 0 2px 6px rgba(25, 135, 84, 0.4);
}

.btn-outline-success.active {
  background-color: #198754;
  border-color: #198754;
  color: white;
  box-shadow: 0 3px 8px rgba(25, 135, 84, 0.3);
}


.alert {
  border-radius: 0.5rem;
  border: none;
}

.text-danger {
  color: #dc3545 !important;
}

@media (max-width: 768px) {
  .register-page {
    padding: 1rem;
  }

  .card-body {
    padding: 2rem !important;
  }

  .logo {
    width: 60px;
    height: 60px;
  }
}
</style>