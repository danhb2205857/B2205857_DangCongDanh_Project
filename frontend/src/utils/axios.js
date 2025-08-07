import axios from 'axios'

// Create axios instance with default config
const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Handle different error types
    if (error.response) {
      // Server responded with error status
      const { status, data } = error.response
      
      switch (status) {
        case 401:
          // Unauthorized - token expired or invalid
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('userRole')
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
          break
          
        case 403:
          // Forbidden - insufficient permissions
          console.error('Không có quyền truy cập:', data.message)
          // Could show a toast notification here
          break
          
        case 404:
          // Not found
          console.error('Không tìm thấy:', data.message)
          break
          
        case 422:
          // Validation error
          console.error('Lỗi validation:', data.message)
          break
          
        case 500:
          // Server error
          console.error('Lỗi server:', data.message)
          break
          
        default:
          console.error('Lỗi API:', data.message || 'Đã xảy ra lỗi')
      }
      
      // Enhance error object with user-friendly message
      error.userMessage = data.message || 'Đã xảy ra lỗi'
      error.errorCode = data.error || 'UNKNOWN_ERROR'
      
    } else if (error.request) {
      // Network error - no response received
      error.userMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
      error.errorCode = 'NETWORK_ERROR'
      console.error('Network error:', error.message)
      
    } else {
      // Something else happened
      error.userMessage = 'Đã xảy ra lỗi không xác định'
      error.errorCode = 'UNKNOWN_ERROR'
      console.error('Error:', error.message)
    }
    
    return Promise.reject(error)
  }
)

export default api