<template>
    <Teleport to="body">
        <div class="error-notifications">
            <Transition v-for="error in errors" :key="error.id" name="error-notification" appear>
                <div class="error-notification"
                    :class="[`error-${error.type}`, { 'error-dismissible': error.dismissible }]">
                    <div class="error-icon">
                        <i :class="getErrorIcon(error.type)"></i>
                    </div>

                    <div class="error-content">
                        <div class="error-title">{{ error.title }}</div>
                        <div v-if="error.message" class="error-message">{{ error.message }}</div>
                        <div v-if="error.details && showDetails" class="error-details">
                            <small>{{ error.details }}</small>
                        </div>
                    </div>

                    <div class="error-actions">
                        <button v-if="error.action" class="error-action-btn" @click="handleAction(error)">
                            {{ error.action.text }}
                        </button>

                        <button v-if="error.dismissible" class="error-close-btn" @click="dismissError(error.id)"
                            title="Đóng">
                            <i class="bi bi-x"></i>
                        </button>
                    </div>
                </div>
            </Transition>
        </div>
    </Teleport>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
    showDetails: {
        type: Boolean,
        default: false
    },
    maxErrors: {
        type: Number,
        default: 5
    },
    autoClose: {
        type: Boolean,
        default: true
    },
    autoCloseDelay: {
        type: Number,
        default: 5000
    }
})

const emit = defineEmits(['error-action', 'error-dismissed'])

// Reactive data
const errors = ref([])
let errorIdCounter = 0

// Computed
const visibleErrors = computed(() => {
    return errors.value.slice(0, props.maxErrors)
})

// Methods
const getErrorIcon = (type) => {
    const icons = {
        error: 'bi bi-exclamation-circle-fill',
        warning: 'bi bi-exclamation-triangle-fill',
        info: 'bi bi-info-circle-fill',
        success: 'bi bi-check-circle-fill'
    }
    return icons[type] || icons.error
}

const addError = (errorData) => {
    const error = {
        id: ++errorIdCounter,
        type: errorData.type || 'error',
        title: errorData.title || 'Lỗi',
        message: errorData.message,
        details: errorData.details,
        dismissible: errorData.dismissible !== false,
        action: errorData.action,
        timestamp: Date.now()
    }

    errors.value.unshift(error)

    // Auto close if enabled
    if (props.autoClose && error.dismissible) {
        setTimeout(() => {
            dismissError(error.id)
        }, props.autoCloseDelay)
    }

    return error.id
}

const dismissError = (errorId) => {
    const index = errors.value.findIndex(error => error.id === errorId)
    if (index > -1) {
        const error = errors.value[index]
        errors.value.splice(index, 1)
        emit('error-dismissed', error)
    }
}

const handleAction = (error) => {
    emit('error-action', error)
    if (error.action.dismiss) {
        dismissError(error.id)
    }
}

const clearAll = () => {
    errors.value = []
}

// Helper methods for different error types
const showError = (message, details = null) => {
    return addError({
        type: 'error',
        title: 'Lỗi',
        message,
        details
    })
}

const showWarning = (message, details = null) => {
    return addError({
        type: 'warning',
        title: 'Cảnh báo',
        message,
        details
    })
}

const showInfo = (message, details = null) => {
    return addError({
        type: 'info',
        title: 'Thông tin',
        message,
        details
    })
}

const showSuccess = (message, details = null) => {
    return addError({
        type: 'success',
        title: 'Thành công',
        message,
        details
    })
}

const showNetworkError = () => {
    return addError({
        type: 'error',
        title: 'Lỗi kết nối',
        message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.',
        action: {
            text: 'Thử lại',
            dismiss: true
        }
    })
}

const showValidationError = (errors) => {
    const message = Array.isArray(errors) ? errors.join(', ') : errors
    return addError({
        type: 'warning',
        title: 'Lỗi validation',
        message
    })
}

// Expose methods
defineExpose({
    addError,
    dismissError,
    clearAll,
    showError,
    showWarning,
    showInfo,
    showSuccess,
    showNetworkError,
    showValidationError
})
</script>

<style scoped>
.error-notifications {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    max-width: 400px;
    pointer-events: none;
}

.error-notification {
    display: flex;
    align-items: flex-start;
    gap: 12px;
    padding: 16px;
    margin-bottom: 12px;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    border-left: 4px solid;
    pointer-events: auto;
    max-width: 100%;
    word-wrap: break-word;
}

.error-error {
    border-left-color: #dc3545;
}

.error-warning {
    border-left-color: #ffc107;
}

.error-info {
    border-left-color: #17a2b8;
}

.error-success {
    border-left-color: #28a745;
}

.error-icon {
    flex-shrink: 0;
    font-size: 20px;
    margin-top: 2px;
}

.error-error .error-icon {
    color: #dc3545;
}

.error-warning .error-icon {
    color: #ffc107;
}

.error-info .error-icon {
    color: #17a2b8;
}

.error-success .error-icon {
    color: #28a745;
}

.error-content {
    flex: 1;
    min-width: 0;
}

.error-title {
    font-weight: 600;
    font-size: 14px;
    color: #333;
    margin-bottom: 4px;
}

.error-message {
    font-size: 13px;
    color: #666;
    line-height: 1.4;
}

.error-details {
    margin-top: 8px;
    padding-top: 8px;
    border-top: 1px solid #eee;
}

.error-details small {
    color: #999;
    font-size: 11px;
}

.error-actions {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    flex-shrink: 0;
}

.error-action-btn {
    background: #007bff;
    color: white;
    border: none;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 12px;
    cursor: pointer;
    transition: background-color 0.2s;
}

.error-action-btn:hover {
    background: #0056b3;
}

.error-close-btn {
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 2px;
    border-radius: 2px;
    transition: color 0.2s;
}

.error-close-btn:hover {
    color: #666;
}

/* Transitions */
.error-notification-enter-active,
.error-notification-leave-active {
    transition: all 0.3s ease;
}

.error-notification-enter-from {
    opacity: 0;
    transform: translateX(100%);
}

.error-notification-leave-to {
    opacity: 0;
    transform: translateX(100%);
}

/* Responsive */
@media (max-width: 768px) {
    .error-notifications {
        top: 10px;
        right: 10px;
        left: 10px;
        max-width: none;
    }

    .error-notification {
        padding: 12px;
        margin-bottom: 8px;
    }
}
</style>