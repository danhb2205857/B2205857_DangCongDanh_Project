<template>
  <Teleport to="body">
    <Transition name="modal" appear>
      <div
        v-if="show"
        class="modal-overlay"
        :class="{ 'modal-static': !dismissible }"
        @click="handleOverlayClick"
      >
        <div
          class="modal-container"
          :class="[sizeClass, { 'modal-fullscreen': fullscreen }]"
          @click.stop
        >
          <!-- Modal Header -->
          <div v-if="showHeader" class="modal-header" :class="headerClass">
            <div class="modal-title-container">
              <i v-if="icon" :class="icon" class="modal-icon"></i>
              <h5 class="modal-title">
                <slot name="title">{{ title }}</slot>
              </h5>
            </div>
            <button
              v-if="closable"
              type="button"
              class="modal-close"
              @click="handleClose"
              :disabled="loading"
              title="Đóng"
            >
              <i class="bi bi-x-lg"></i>
            </button>
          </div>

          <!-- Modal Body -->
          <div class="modal-body" :class="bodyClass">
            <div v-if="loading" class="modal-loading">
              <div class="d-flex justify-content-center align-items-center py-4">
                <div class="spinner-border text-primary" role="status">
                  <span class="sr-only">Đang tải...</span>
                </div>
                <span class="ms-2">{{ loadingText }}</span>
              </div>
            </div>
            <div v-else>
              <slot></slot>
            </div>
          </div>

          <!-- Modal Footer -->
          <div v-if="showFooter" class="modal-footer" :class="footerClass">
            <slot name="footer">
              <button
                v-if="showCancelButton"
                type="button"
                class="btn btn-secondary"
                @click="handleCancel"
                :disabled="loading"
              >
                {{ cancelText }}
              </button>
              <button
                v-if="showConfirmButton"
                type="button"
                class="btn"
                :class="confirmButtonClass"
                @click="handleConfirm"
                :disabled="loading || confirmDisabled"
              >
                <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status"></span>
                {{ confirmText }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  // Visibility
  show: {
    type: Boolean,
    default: false
  },
  
  // Modal settings
  title: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg', 'xl'].includes(value)
  },
  fullscreen: {
    type: Boolean,
    default: false
  },
  
  // Behavior
  closable: {
    type: Boolean,
    default: true
  },
  dismissible: {
    type: Boolean,
    default: true
  },
  persistent: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: 'Đang xử lý...'
  },
  
  // Layout
  showHeader: {
    type: Boolean,
    default: true
  },
  showFooter: {
    type: Boolean,
    default: true
  },
  headerClass: {
    type: String,
    default: ''
  },
  bodyClass: {
    type: String,
    default: ''
  },
  footerClass: {
    type: String,
    default: ''
  },
  
  // Buttons
  showCancelButton: {
    type: Boolean,
    default: true
  },
  showConfirmButton: {
    type: Boolean,
    default: true
  },
  cancelText: {
    type: String,
    default: 'Hủy'
  },
  confirmText: {
    type: String,
    default: 'Xác nhận'
  },
  confirmType: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'warning', 'danger', 'info'].includes(value)
  },
  confirmDisabled: {
    type: Boolean,
    default: false
  },
  
  // Auto close
  autoClose: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits([
  'update:show',
  'open',
  'close',
  'confirm',
  'cancel',
  'overlay-click'
])

// Computed properties
const sizeClass = computed(() => {
  const sizeMap = {
    sm: 'modal-sm',
    md: 'modal-md',
    lg: 'modal-lg',
    xl: 'modal-xl'
  }
  return sizeMap[props.size] || 'modal-md'
})

const confirmButtonClass = computed(() => {
  return `btn-${props.confirmType}`
})

// Auto close timer
let autoCloseTimer = null

// Methods
const handleClose = () => {
  if (props.loading && props.persistent) return
  emit('update:show', false)
  emit('close')
}

const handleConfirm = () => {
  emit('confirm')
}

const handleCancel = () => {
  emit('cancel')
  if (!props.persistent) {
    handleClose()
  }
}

const handleOverlayClick = () => {
  emit('overlay-click')
  if (props.dismissible && !props.loading) {
    handleClose()
  }
}

const handleEscapeKey = (event) => {
  if (event.key === 'Escape' && props.show && props.closable && !props.loading) {
    handleClose()
  }
}

// Focus management
const focusFirstElement = () => {
  nextTick(() => {
    const modal = document.querySelector('.modal-container')
    if (modal) {
      const focusableElements = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      )
      if (focusableElements.length > 0) {
        focusableElements[0].focus()
      }
    }
  })
}

const trapFocus = (event) => {
  if (!props.show) return
  
  const modal = document.querySelector('.modal-container')
  if (!modal) return
  
  const focusableElements = modal.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  const firstElement = focusableElements[0]
  const lastElement = focusableElements[focusableElements.length - 1]
  
  if (event.key === 'Tab') {
    if (event.shiftKey) {
      if (document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }
  }
}

// Watchers
watch(() => props.show, (newValue) => {
  if (newValue) {
    emit('open')
    focusFirstElement()
    
    // Set up auto close
    if (props.autoClose > 0) {
      autoCloseTimer = setTimeout(() => {
        handleClose()
      }, props.autoClose)
    }
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
  } else {
    // Clear auto close timer
    if (autoCloseTimer) {
      clearTimeout(autoCloseTimer)
      autoCloseTimer = null
    }
    
    // Restore body scroll
    document.body.style.overflow = ''
  }
})

// Lifecycle
onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
  document.addEventListener('keydown', trapFocus)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
  document.removeEventListener('keydown', trapFocus)
  
  // Clear auto close timer
  if (autoCloseTimer) {
    clearTimeout(autoCloseTimer)
  }
  
  // Restore body scroll
  document.body.style.overflow = ''
})
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
  padding: 1rem;
}

.modal-static {
  cursor: not-allowed;
}

.modal-container {
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 2rem);
  width: 100%;
  max-width: 500px;
  position: relative;
}

.modal-sm {
  max-width: 300px;
}

.modal-md {
  max-width: 500px;
}

.modal-lg {
  max-width: 800px;
}

.modal-xl {
  max-width: 1140px;
}

.modal-fullscreen {
  max-width: none;
  max-height: none;
  height: calc(100vh - 2rem);
  width: calc(100vw - 2rem);
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e3e6f0;
  border-radius: 0.5rem 0.5rem 0 0;
  background-color: #f8f9fc;
}

.modal-title-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.modal-icon {
  font-size: 1.25rem;
  color: #4e73df;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #5a5c69;
}

.modal-close {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #858796;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 0.25rem;
  transition: all 0.15s ease;
}

.modal-close:hover {
  color: #5a5c69;
  background-color: rgba(0, 0, 0, 0.1);
}

.modal-close:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.modal-body {
  flex: 1;
  padding: 1.5rem;
  overflow-y: auto;
}

.modal-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100px;
}

.modal-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-top: 1px solid #e3e6f0;
  border-radius: 0 0 0.5rem 0.5rem;
  background-color: #f8f9fc;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

/* Transitions */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-container,
.modal-leave-active .modal-container {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-container,
.modal-leave-to .modal-container {
  transform: scale(0.9) translateY(-50px);
}

/* Responsive */
@media (max-width: 768px) {
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-container {
    max-height: calc(100vh - 1rem);
  }
  
  .modal-fullscreen {
    height: calc(100vh - 1rem);
    width: calc(100vw - 1rem);
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: 1rem;
  }
  
  .modal-footer {
    flex-direction: column-reverse;
    align-items: stretch;
  }
  
  .modal-footer .btn {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .modal-footer .btn:last-child {
    margin-bottom: 0;
  }
}

@media (max-width: 576px) {
  .modal-sm,
  .modal-md,
  .modal-lg,
  .modal-xl {
    max-width: none;
    width: calc(100vw - 1rem);
  }
}
</style>