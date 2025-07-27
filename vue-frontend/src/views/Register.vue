<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>Đăng ký</h1>
        <p>Tạo tài khoản mới</p>
      </div>
      
      <form @submit.prevent="handleRegister">
        <div class="form-floating mb-3">
          <input 
            type="text" 
            class="form-control" 
            id="username" 
            v-model="registerForm.username"
            placeholder="Tên đăng nhập"
            required
          >
          <label for="username">Tên đăng nhập</label>
        </div>
        
        <div class="form-floating mb-3">
          <input 
            type="text" 
            class="form-control" 
            id="fullName" 
            v-model="registerForm.fullName"
            placeholder="Họ và tên"
            required
          >
          <label for="fullName">Họ và tên</label>
        </div>
        
        <div class="form-floating mb-3">
          <input 
            type="password" 
            class="form-control" 
            id="password" 
            v-model="registerForm.password"
            placeholder="Mật khẩu"
            required
          >
          <label for="password">Mật khẩu</label>
        </div>
        
        <div class="form-floating mb-3">
          <input 
            type="password" 
            class="form-control" 
            id="confirmPassword" 
            v-model="registerForm.confirmPassword"
            placeholder="Xác nhận mật khẩu"
            required
          >
          <label for="confirmPassword">Xác nhận mật khẩu</label>
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

const router = useRouter()

const registerForm = ref({
  username: '',
  fullName: '',
  password: '',
  confirmPassword: ''
})

const loading = ref(false)
const error = ref('')

const handleRegister = async () => {
  if (registerForm.value.password !== registerForm.value.confirmPassword) {
    error.value = 'Mật khẩu xác nhận không khớp'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    // TODO: Implement actual register API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Mock successful registration
    router.push('/login')
  } catch (err) {
    error.value = 'Đăng ký thất bại. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import '../assets/main_admin.css';
</style>