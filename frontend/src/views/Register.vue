<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>Đăng ký</h1>
        <p>Tạo tài khoản mới</p>
      </div>

      <form @submit.prevent="handleRegister">
        <div class="form-floating mb-3">
          <input type="text" class="form-control" id="username" v-model="registerForm.username"
            placeholder="Tên đăng nhập" required>
          <label for="username">Tên đăng nhập</label>
        </div>

        <div class="form-floating mb-3">
          <input type="text" class="form-control" id="fullName" v-model="registerForm.fullName" placeholder="Họ và tên"
            required>
          <label for="fullName">Họ và tên</label>
        </div>

        <div class="form-floating mb-3">
          <input type="password" class="form-control" id="password" v-model="registerForm.password"
            placeholder="Mật khẩu" required>
          <label for="password">Mật khẩu</label>
        </div>

        <div class="form-floating mb-3">
          <input type="password" class="form-control" id="confirmPassword" v-model="registerForm.confirmPassword"
            placeholder="Xác nhận mật khẩu" required>
          <label for="confirmPassword">Xác nhận mật khẩu</label>
        </div>

        <div class="form-floating mb-3">
          <input type="email" class="form-control" id="email" v-model="registerForm.email"
            placeholder="Email (tùy chọn)">
          <label for="email">Email (tùy chọn)</label>
        </div>

        <div class="form-floating mb-3">
          <input type="tel" class="form-control" id="phone" v-model="registerForm.phone" placeholder="Số điện thoại"
            required>
          <label for="phone">Số điện thoại</label>
        </div>

        <div class="form-floating mb-3">
          <textarea class="form-control" id="address" v-model="registerForm.address" placeholder="Địa chỉ"
            style="height: 80px" required></textarea>
          <label for="address">Địa chỉ</label>
        </div>

        <div class="form-floating mb-3">
          <input type="date" class="form-control" id="birthDate" v-model="registerForm.birthDate"
            placeholder="Ngày sinh (tùy chọn)">
          <label for="birthDate">Ngày sinh (tùy chọn)</label>
        </div>

        <button type="submit" class="btn btn-primary btn-login w-100" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Đang đăng ký...' : 'Đăng ký' }}
        </button>
      </form>

      <div v-if="error" class="alert alert-danger mt-3">
        {{ error }}
      </div>

      <div class="text-center mt-3">
        <router-link to="/login" class="text-decoration-none">
          Đã có tài khoản? Đăng nhập
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/utils/axios'

const router = useRouter()

const registerForm = ref({
  username: '',
  fullName: '',
  password: '',
  confirmPassword: '',
  email: '',
  phone: '',
  address: '',
  birthDate: ''
})

const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  // Validate form
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    error.value = 'Mật khẩu xác nhận không khớp'
    return
  }

  if (registerForm.value.password.length < 6) {
    error.value = 'Mật khẩu phải có ít nhất 6 ký tự'
    return
  }

  if (!/[a-zA-Z]/.test(registerForm.value.password)) {
    error.value = 'Mật khẩu phải chứa ít nhất một chữ cái'
    return
  }

  if (!/\d/.test(registerForm.value.password)) {
    error.value = 'Mật khẩu phải chứa ít nhất một số'
    return
  }

  if (!/^(0|\+84)[0-9]{9,10}$/.test(registerForm.value.phone)) {
    error.value = 'Số điện thoại không hợp lệ'
    return
  }

  if (registerForm.value.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(registerForm.value.email)) {
    error.value = 'Email không hợp lệ'
    return
  }

  loading.value = true
  error.value = ''

  try {
    // Gọi API đăng ký
    const response = await axios.post('/auth/register', {
      username: registerForm.value.username,
      fullName: registerForm.value.fullName,
      password: registerForm.value.password,
      email: registerForm.value.email,
      phone: registerForm.value.phone,
      address: registerForm.value.address,
      birthDate: registerForm.value.birthDate
    })

    if (response.data.success) {
      // Đăng ký thành công, chuyển về trang login
      router.push('/login')
    } else {
      error.value = response.data.message || 'Đăng ký thất bại'
    }
  } catch (err) {
    console.error('Register error:', err)

    if (err.response) {
      error.value = err.response.data.message || 'Đăng ký thất bại'
    } else if (err.request) {
      error.value = 'Không thể kết nối đến server'
    } else {
      error.value = 'Đăng ký thất bại. Vui lòng thử lại.'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import '@/assets/styles/pages/auth.css';
</style>