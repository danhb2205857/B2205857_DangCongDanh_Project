<template>
  <div class="col-xl-3 col-md-6 mb-4">
    <div class="card shadow h-100 py-2" :class="borderClass">
      <div class="card-body">
        <div class="row no-gutters align-items-center">
          <div class="col mr-2">
            <div class="text-xs font-weight-bold text-uppercase mb-1" :class="textClass">
              {{ title }}
            </div>
            <div class="h5 mb-0 font-weight-bold text-gray-800">
              {{ formattedValue }}
            </div>
            <div v-if="subtitle" class="text-xs text-muted mt-1">
              {{ subtitle }}
            </div>
          </div>
          <div class="col-auto">
            <i :class="iconClass" style="font-size: 2rem;"></i>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: [Number, String],
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    required: true
  },
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'info', 'warning', 'danger'].includes(value)
  },
  format: {
    type: String,
    default: 'number',
    validator: (value) => ['number', 'currency', 'percentage'].includes(value)
  }
})

const borderClass = computed(() => `border-left-${props.color}`)
const textClass = computed(() => `text-${props.color}`)
const iconClass = computed(() => `${props.icon} text-${props.color}`)

const formattedValue = computed(() => {
  const value = props.value
  
  if (typeof value !== 'number') {
    return value
  }
  
  switch (props.format) {
    case 'currency':
      return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
      }).format(value)
    case 'percentage':
      return `${value}%`
    default:
      return new Intl.NumberFormat('vi-VN').format(value)
  }
})
</script>

<style scoped>
.border-left-primary {
  border-left: 0.25rem solid #4e73df !important;
}

.border-left-success {
  border-left: 0.25rem solid #1cc88a !important;
}

.border-left-info {
  border-left: 0.25rem solid #36b9cc !important;
}

.border-left-warning {
  border-left: 0.25rem solid #f6c23e !important;
}

.border-left-danger {
  border-left: 0.25rem solid #e74a3b !important;
}

.text-xs {
  font-size: 0.7rem;
}

.text-gray-800 {
  color: #5a5c69 !important;
}

.shadow {
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15) !important;
}
</style>