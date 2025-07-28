<template>
  <div class="container mt-5">
    <div class="row justify-content-center">
      <div class="col-md-8">
        <div class="card">
          <div class="card-header">
            <h5>Authentication Test Page</h5>
          </div>
          <div class="card-body">
            <!-- Auth Status -->
            <div class="mb-4">
              <h6>Trạng thái xác thực:</h6>
              <div class="alert" :class="isAuthenticated ? 'alert-success' : 'alert-warning'">
                <strong>{{ isAuthenticated ? 'Đã đăng nhập' : 'Chưa đăng nhập' }}</strong>
              </div>
            </div>

            <!-- User Info -->
            <div v-if="isAuthenticated" class="mb-4">
              <h6>Thông tin người dùng:</h6>
              <div class="card bg-light">
                <div class="card-body">
                  <p><strong>ID:</strong> {{ user?.id }}</p>
                  <p><strong>Username:</strong> {{ user?.username }}</p>
                  <p><strong>Tên:</strong> {{ user?.name }}</p>
                  <p><strong>Vai trò:</strong> {{ user?.role }}</p>
                </div>
              </div>
            </div>

            <!-- Token Info -->
            <div v-if="token" class="mb-4">
              <h6>Token Information:</h6>
              <div class="card bg-light">
                <div class="card-body">
                  <p><strong>Token:</strong> <code>{{ token.substring(0, 50) }}...</code></p>
                  <p><strong>Hết hạn:</strong> {{ tokenExpiry }}</p>
                  <p><strong>Còn lại:</strong> {{ timeUntilExpiry }}</p>
                </div>
              </div>
            </div>

            <!-- Test Actions -->
            <div class="mb-4">
              <h6>Test Actions:</h6>
              <div class="btn-group" role="group">
                <button 
                  v-if="!isAuthenticated" 
                  @click="testLogin" 
                  class="btn btn-primary"
                  :disabled="loading"
                >
                  <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                  Test Login (admin/admin)
                </button>
                
                <button 
                  v-if="isAuthenticated" 
                  @click="testLogout" 
                  class="btn btn-danger"
                >
                  Test Logout
                </button>
                
                <button @click="checkTokenExpiry" class="btn btn-info">
                  Check Token Expiry
                </button>
                
                <button @click="clearStorage" class="btn btn-warning">
                  Clear Storage
                </button>
              </div>
            </div>

            <!-- Messages -->
            <div v-if="message" class="alert" :class="messageType">
              {{ message }}
            </div>

            <!-- Navigation Links -->
            <div class="mt-4">
              <h6>Navigation Test:</h6>
              <div class="btn-group" role="group">
                <router-link to="/" class="btn btn-outline-secondary">Home</router-link>
                <router-link to="/login" class="btn btn-outline-primary">Login</router-link>
                <router-link to="/admin" class="btn btn-outline-success">Admin</router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const { token, user, isAuthenticated, login, logout } = useAuth()

const loading = ref(false)
const message = ref('')
const messageType = ref('alert-info')

// Computed properties for token info
const tokenExpiry = computed(() => {
  if (!token.value) return 'N/A'
  
  try {
    // Simple mock expiry - 24 hours from now
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000)
    return new Date(expiryTime).toLocaleString('vi-VN')
  } catch (error) {
    return 'Invalid token'
  }
})

const timeUntilExpiry = computed(() => {
  if (!token.value) return 'N/A'
  
  try {
    // Simple mock - always show 24 hours for mock token
    return '24h 0m'
  } catch (error) {
    return 'Invalid token'
  }
})

// Test functions
const testLogin = async () => {
  loading.value = true
  message.value = ''
  
  try {
    const result = await login({
      username: 'admin',
      password: 'admin'
    })
    
    if (result.success) {
      message.value = 'Đăng nhập thành công!'
      messageType.value = 'alert-success'
    } else {
      message.value = result.error
      messageType.value = 'alert-danger'
    }
  } catch (error) {
    message.value = 'Lỗi đăng nhập: ' + error.message
    messageType.value = 'alert-danger'
  } finally {
    loading.value = false
  }
}

const testLogout = async () => {
  try {
    await logout()
    message.value = 'Đăng xuất thành công!'
    messageType.value = 'alert-success'
  } catch (error) {
    message.value = 'Lỗi đăng xuất: ' + error.message
    messageType.value = 'alert-danger'
  }
}

const checkTokenExpiry = () => {
  if (!token.value) {
    message.value = 'Không có token'
    messageType.value = 'alert-warning'
    return
  }
  
  try {
    // For mock token, always show as valid
    message.value = 'Token còn hiệu lực (Mock token)'
    messageType.value = 'alert-success'
  } catch (error) {
    message.value = 'Token không hợp lệ'
    messageType.value = 'alert-danger'
  }
}

const clearStorage = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  location.reload()
}

onMounted(() => {
  message.value = 'Trang test authentication đã sẵn sàng'
  messageType.value = 'alert-info'
})
</script>

<style scoped>
code {
  background-color: #f8f9fa;
  padding: 2px 4px;
  border-radius: 3px;
  font-size: 0.9em;
}
</style>