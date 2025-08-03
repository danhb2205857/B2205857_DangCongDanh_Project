import { ref } from 'vue'

// Global error notification instance
let errorNotificationInstance = null

export const useErrorHandler = () => {
  const loading = ref(false)
  const error = ref(null)

  // Set error notification instance
  const setErrorNotificationInstance = (instance) => {
    errorNotificationInstance = instance
  }

  // Handle API errors
  const handleApiError = (apiError, customMessage = null) => {
    console.error('API Error:', apiError)
    
    let title = 'Lỗi'
    let message = customMessage || apiError.userMessage || 'Đã xảy ra lỗi không xác định'
    let type = 'error'
    
    // Determine error type based on status code
    if (apiError.response) {
      const status = apiError.response.status
      
      switch (status) {
        case 400:
          title = 'Dữ liệu không hợp lệ'
          type = 'warning'
          break
        case 401:
          title = 'Không có quyền truy cập'
          message = 'Vui lòng đăng nhập lại'
          break
        case 403:
          title = 'Không đủ quyền'
          message = 'Bạn không có quyền thực hiện thao tác này'
          break
        case 404:
          title = 'Không tìm thấy'
          break
        case 422:
          title = 'Lỗi validation'
          type = 'warning'
          break
        case 500:
          title = 'Lỗi server'
          message = 'Đã xảy ra lỗi trên server. Vui lòng thử lại sau.'
          break
      }
    } else if (apiError.code === 'NETWORK_ERROR' || !apiError.response) {
      title = 'Lỗi kết nối'
      message = 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.'
      type = 'error'
    }
    
    // Show error notification if instance is available
    if (errorNotificationInstance) {
      errorNotificationInstance.addError({
        type,
        title,
        message,
        details: apiError.errorCode || null
      })
    }
    
    // Set local error state
    error.value = {
      title,
      message,
      code: apiError.errorCode,
      status: apiError.response?.status
    }
    
    return error.value
  }

  // Handle validation errors
  const handleValidationError = (validationErrors) => {
    const message = Array.isArray(validationErrors) 
      ? validationErrors.join(', ') 
      : validationErrors
    
    if (errorNotificationInstance) {
      errorNotificationInstance.showValidationError(message)
    }
    
    error.value = {
      title: 'Lỗi validation',
      message,
      type: 'validation'
    }
    
    return error.value
  }

  // Handle network errors
  const handleNetworkError = () => {
    if (errorNotificationInstance) {
      errorNotificationInstance.showNetworkError()
    }
    
    error.value = {
      title: 'Lỗi kết nối',
      message: 'Không thể kết nối đến server',
      type: 'network'
    }
    
    return error.value
  }

  // Show success message
  const showSuccess = (message, title = 'Thành công') => {
    if (errorNotificationInstance) {
      errorNotificationInstance.showSuccess(message)
    }
  }

  // Show info message
  const showInfo = (message, title = 'Thông tin') => {
    if (errorNotificationInstance) {
      errorNotificationInstance.showInfo(message)
    }
  }

  // Show warning message
  const showWarning = (message, title = 'Cảnh báo') => {
    if (errorNotificationInstance) {
      errorNotificationInstance.showWarning(message)
    }
  }

  // Async wrapper with error handling
  const withErrorHandling = async (asyncFn, customErrorMessage = null) => {
    loading.value = true
    error.value = null
    
    try {
      const result = await asyncFn()
      return result
    } catch (err) {
      handleApiError(err, customErrorMessage)
      throw err
    } finally {
      loading.value = false
    }
  }

  // Clear error state
  const clearError = () => {
    error.value = null
  }

  // Clear all notifications
  const clearAllNotifications = () => {
    if (errorNotificationInstance) {
      errorNotificationInstance.clearAll()
    }
  }

  return {
    // State
    loading,
    error,
    
    // Methods
    setErrorNotificationInstance,
    handleApiError,
    handleValidationError,
    handleNetworkError,
    showSuccess,
    showInfo,
    showWarning,
    withErrorHandling,
    clearError,
    clearAllNotifications
  }
}

// Global error handler instance
export const globalErrorHandler = useErrorHandler()

// Helper function to handle common API operations
export const handleApiOperation = async (
  operation,
  successMessage = null,
  errorMessage = null
) => {
  try {
    const result = await globalErrorHandler.withErrorHandling(operation, errorMessage)
    
    if (successMessage) {
      globalErrorHandler.showSuccess(successMessage)
    }
    
    return result
  } catch (error) {
    // Error already handled by withErrorHandling
    throw error
  }
}