<template>
  <div class="login-page">
    <div class="container">
      <div class="row justify-content-center">
        <div class="col-md-6 col-lg-5">
          <div class="card shadow-lg border-0">
            <div class="card-body p-5">
              <!-- Header -->
              <div class="text-center mb-4">
                <img src="/images/logo.png" alt="Logo" class="logo mb-3" @error="handleLogoError">
                <h2 class="fw-bold text-primary">Đăng nhập</h2>
                <p class="text-muted">Đăng nhập vào tài khoản độc giả hoặc nhân viên</p>
              </div>

              <!-- Chọn loại đăng nhập -->
              <div class="mb-4 d-flex justify-content-center gap-3">
                <button type="button" class="btn btn-outline-primary" :class="{ active: loginType === 'reader' }"
                  @click="loginType = 'reader'">Độc giả</button>
                <button type="button" class="btn btn-outline-success" :class="{ active: loginType === 'staff' }"
                  @click="loginType = 'staff'">Nhân viên</button>
              </div>

              <!-- Login Form -->
              <form @submit.prevent="handleLogin">
                <div class="mb-3">
                  <label for="email" class="form-label">{{ loginType === 'reader' ? 'Email' : 'Mã nhân viên' }}</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i :class="loginType === 'reader' ? 'fas fa-envelope' : 'fas fa-id-badge'"></i>
                    </span>
                    <input v-model="form.email" :type="loginType === 'reader' ? 'email' : 'text'" class="form-control"
                      id="email" :placeholder="loginType === 'reader' ? 'Nhập email của bạn' : 'Nhập mã nhân viên'"
                      required :disabled="loading">
                  </div>
                </div>

                <div class="mb-3">
                  <label for="password" class="form-label">Mật khẩu</label>
                  <div class="input-group">
                    <span class="input-group-text">
                      <i class="fas fa-lock"></i>
                    </span>
                    <input v-model="form.password" :type="showPassword ? 'text' : 'password'" class="form-control"
                      id="password" placeholder="Nhập mật khẩu" required :disabled="loading">
                    <button type="button" class="btn btn-outline-secondary" @click="showPassword = !showPassword"
                      :disabled="loading">
                      <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                </div>

                <div class="mb-3 form-check">
                  <input v-model="form.rememberMe" type="checkbox" class="form-check-input" id="rememberMe"
                    :disabled="loading">
                  <label class="form-check-label" for="rememberMe">
                    Ghi nhớ đăng nhập
                  </label>
                </div>

                <!-- Error Message -->
                <div v-if="error" class="alert alert-danger" role="alert">
                  <i class="fas fa-exclamation-circle me-2"></i>
                  {{ error }}
                </div>

                <!-- Submit Button -->
                <button type="submit" class="btn btn-primary w-100 py-2 mb-3" :disabled="loading">
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                  <i v-else class="fas fa-sign-in-alt me-2"></i>
                  {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
                </button>

                <!-- Links -->
                <div class="text-center">
                  <p class="mb-2">
                    <router-link to="/forgot-password" class="text-decoration-none">
                      Quên mật khẩu?
                    </router-link>
                  </p>
                  <p class="mb-0">
                    Chưa có tài khoản?
                    <router-link to="/register" class="text-decoration-none fw-bold">
                      Đăng ký ngay
                    </router-link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          <!-- Back to Home -->
          <div class="text-center mt-3">
            <router-link to="/" class="text-decoration-none">
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
import { ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '@/composables/useAuth'

export default {
  name: 'Login',
  setup() {
    const router = useRouter()
    const route = useRoute()
    const { login, loginStaff, isAuthenticated } = useAuth()

    const loginType = ref('reader') // 'reader' hoặc 'staff'
    const form = ref({
      email: '',
      password: '',
      rememberMe: false
    })

    const loading = ref(false)
    const error = ref('')
    const showPassword = ref(false)

    // Redirect if already authenticated
    onMounted(() => {
      if (isAuthenticated.value) {
        router.push('/')
      }
    })

    const handleLogin = async () => {
      if (loading.value) return

      // Validate input
      if (loginType.value === 'reader') {
        // Email required & đúng định dạng
        if (!form.value.email || !/^\S+@\S+\.\S+$/.test(form.value.email)) {
          error.value = 'Vui lòng nhập đúng email!'
          return
        }
      } else {
        // Mã NVxxx required
        if (!/^NV\d{3,}$/.test(form.value.email.trim())) {
          error.value = 'Vui lòng nhập đúng mã nhân viên (VD: NV003)!'
          return
        }
      }

      loading.value = true
      error.value = ''

      try {
        let result
        let userRole
        if (loginType.value === 'staff') {
          result = await loginStaff({
            username: form.value.email.trim(),
            password: form.value.password
          })
          userRole = 'staff'
        } else {
          result = await login({
            email: form.value.email,
            password: form.value.password
          })
          userRole = 'reader'
        }

        if (result.success) {
          window.dispatchEvent(new CustomEvent('show-message', {
            detail: {
              message: 'Đăng nhập thành công!',
              type: 'success'
            }
          }))
          let redirectTo = route.query.redirect
          if (!redirectTo) {
            redirectTo = userRole === 'staff' ? '/admin' : '/'
          }
          router.push(redirectTo)
        } else {
          error.value = result.error || 'Đăng nhập thất bại'
        }
      } catch (err) {
        console.error('Login error:', err)
        error.value = 'Có lỗi xảy ra, vui lòng thử lại'
      } finally {
        loading.value = false
      }
    }

    const handleLogoError = (event) => {
      event.target.style.display = 'none'
    }

    return {
      form,
      loading,
      error,
      showPassword,
      handleLogin,
      handleLogoError,
      loginType
    }
  }
}
</script>

<style scoped>
.login-page {
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

.form-control {
  border-left: none;
}

.form-control:focus {
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

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(13, 110, 253, 0.4);
}

.btn-primary:disabled {
  transform: none;
  box-shadow: none;
}

.alert {
  border-radius: 0.5rem;
  border: none;
}

/* Button styling cho loại đăng nhập */
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

@media (max-width: 768px) {
  .login-page {
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