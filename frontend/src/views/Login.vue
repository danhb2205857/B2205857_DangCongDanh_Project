<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-header">
        <h1>Đăng nhập</h1>
        <p>Hệ thống quản lý mượn sách</p>
      </div>
      
      <form @submit.prevent="handleLogin">
        <div class="form-floating mb-3">
          <input 
            type="text" 
            class="form-control" 
            id="username" 
            v-model="loginForm.username"
            placeholder="Tên đăng nhập"
            required
          >
          <label for="username">Tên đăng nhập</label>
        </div>
        
        <div class="form-floating mb-3">
          <input 
            type="password" 
            class="form-control" 
            id="password" 
            v-model="loginForm.password"
            placeholder="Mật khẩu"
            required
          >
          <label for="password">Mật khẩu</label>
        </div>
        
        <button type="submit" class="btn btn-primary btn-login w-100" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
          {{ loading ? 'Đang đăng nhập...' : 'Đăng nhập' }}
        </button>
      </form>
      
      <div v-if="error" class="alert alert-danger mt-3">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { login } = useAuth()

const loginForm = ref({
  username: '',
  password: ''
})

const loading = ref(false)
const error = ref('')

const handleLogin = async () => {
  loading.value = true
  error.value = ''
  
  try {
    const result = await login(loginForm.value)
    
    if (result.success) {
      // Chuyển hướng đến admin dashboard
      router.push('/admin')
    } else {
      error.value = result.error
    }
  } catch (err) {
    error.value = 'Đăng nhập thất bại. Vui lòng thử lại.'
  } finally {
    loading.value = false
  }
}
</script>

<style>
@import '@/assets/styles/pages/auth.css';
</style>