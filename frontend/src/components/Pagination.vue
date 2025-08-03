<template>
  <div class="pagination-container">
    <div class="pagination-info">
      <span class="text-muted">
        Hiển thị {{ startItem }} - {{ endItem }} của {{ totalItems }} kết quả
      </span>
      <div v-if="showSizeChanger" class="page-size-selector">
        <label class="form-label">Hiển thị:</label>
        <select
          class="form-select form-select-sm"
          :value="itemsPerPage"
          @change="handleSizeChange"
        >
          <option
            v-for="size in pageSizeOptions"
            :key="size"
            :value="size"
          >
            {{ size }}
          </option>
        </select>
        <span class="form-label">/ trang</span>
      </div>
    </div>

    <nav v-if="totalPages > 1" aria-label="Pagination">
      <ul class="pagination pagination-sm justify-content-center mb-0">
        <!-- First page -->
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button
            class="page-link"
            @click="goToPage(1)"
            :disabled="currentPage === 1"
            title="Trang đầu"
          >
            <i class="bi bi-chevron-double-left"></i>
          </button>
        </li>

        <!-- Previous page -->
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button
            class="page-link"
            @click="goToPage(currentPage - 1)"
            :disabled="currentPage === 1"
            title="Trang trước"
          >
            <i class="bi bi-chevron-left"></i>
          </button>
        </li>

        <!-- Page numbers -->
        <li
          v-for="page in visiblePages"
          :key="page"
          class="page-item"
          :class="{ active: page === currentPage }"
        >
          <button
            v-if="page !== '...'"
            class="page-link"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <span v-else class="page-link disabled">...</span>
        </li>

        <!-- Next page -->
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button
            class="page-link"
            @click="goToPage(currentPage + 1)"
            :disabled="currentPage === totalPages"
            title="Trang sau"
          >
            <i class="bi bi-chevron-right"></i>
          </button>
        </li>

        <!-- Last page -->
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button
            class="page-link"
            @click="goToPage(totalPages)"
            :disabled="currentPage === totalPages"
            title="Trang cuối"
          >
            <i class="bi bi-chevron-double-right"></i>
          </button>
        </li>
      </ul>
    </nav>

    <!-- Quick jump -->
    <div v-if="showQuickJump && totalPages > 10" class="quick-jump">
      <span class="form-label">Đến trang:</span>
      <input
        type="number"
        class="form-control form-control-sm"
        :min="1"
        :max="totalPages"
        v-model.number="jumpPage"
        @keydown.enter="handleQuickJump"
        @blur="handleQuickJump"
      >
      <button
        class="btn btn-sm btn-outline-primary"
        @click="handleQuickJump"
        :disabled="!isValidJumpPage"
      >
        Đi
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
  currentPage: {
    type: Number,
    default: 1
  },
  totalItems: {
    type: Number,
    required: true
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  maxVisiblePages: {
    type: Number,
    default: 7
  },
  showSizeChanger: {
    type: Boolean,
    default: true
  },
  showQuickJump: {
    type: Boolean,
    default: false
  },
  pageSizeOptions: {
    type: Array,
    default: () => [5, 10, 20, 50, 100]
  },
  size: {
    type: String,
    default: 'sm',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  }
})

const emit = defineEmits(['update:currentPage', 'page-change', 'size-change'])

// Reactive data
const jumpPage = ref(props.currentPage)

// Computed properties
const totalPages = computed(() => {
  return Math.ceil(props.totalItems / props.itemsPerPage)
})

const startItem = computed(() => {
  if (props.totalItems === 0) return 0
  return (props.currentPage - 1) * props.itemsPerPage + 1
})

const endItem = computed(() => {
  const end = props.currentPage * props.itemsPerPage
  return Math.min(end, props.totalItems)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = props.currentPage
  const maxVisible = props.maxVisiblePages

  if (total <= maxVisible) {
    // Show all pages if total is less than max visible
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    // Calculate start and end of visible range
    let start = Math.max(1, current - Math.floor(maxVisible / 2))
    let end = Math.min(total, start + maxVisible - 1)

    // Adjust start if end is at the boundary
    if (end === total) {
      start = Math.max(1, end - maxVisible + 1)
    }

    // Add first page and ellipsis if needed
    if (start > 1) {
      pages.push(1)
      if (start > 2) {
        pages.push('...')
      }
    }

    // Add visible pages
    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    // Add ellipsis and last page if needed
    if (end < total) {
      if (end < total - 1) {
        pages.push('...')
      }
      pages.push(total)
    }
  }

  return pages
})

const isValidJumpPage = computed(() => {
  return jumpPage.value >= 1 && jumpPage.value <= totalPages.value
})

// Methods
const goToPage = (page) => {
  if (page < 1 || page > totalPages.value || page === props.currentPage) {
    return
  }
  
  emit('update:currentPage', page)
  emit('page-change', page)
}

const handleSizeChange = (event) => {
  const newSize = parseInt(event.target.value)
  emit('size-change', newSize)
}

const handleQuickJump = () => {
  if (isValidJumpPage.value && jumpPage.value !== props.currentPage) {
    goToPage(jumpPage.value)
  }
}

// Watch for current page changes
watch(() => props.currentPage, (newPage) => {
  jumpPage.value = newPage
})

// Watch for total pages changes
watch(totalPages, (newTotal) => {
  if (props.currentPage > newTotal && newTotal > 0) {
    goToPage(newTotal)
  }
})
</script>

<style scoped>
.pagination-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fc;
  border-top: 1px solid #e3e6f0;
}

.pagination-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.page-size-selector {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.page-size-selector .form-select {
  width: auto;
  min-width: 70px;
}

.page-size-selector .form-label {
  margin-bottom: 0;
  font-size: 0.875rem;
  color: #6c757d;
}

.pagination {
  margin: 0;
}

.page-link {
  color: #4e73df;
  border-color: #d1d3e2;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
}

.page-link:hover {
  color: #224abe;
  background-color: #eaecf4;
  border-color: #d1d3e2;
}

.page-link:focus {
  box-shadow: 0 0 0 0.2rem rgba(78, 115, 223, 0.25);
}

.page-item.active .page-link {
  background-color: #4e73df;
  border-color: #4e73df;
  color: white;
}

.page-item.disabled .page-link {
  color: #858796;
  background-color: #f8f9fc;
  border-color: #d1d3e2;
}

.page-link.disabled {
  color: #858796;
  background-color: transparent;
  border-color: #d1d3e2;
  cursor: default;
}

.quick-jump {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.quick-jump .form-control {
  width: 80px;
  text-align: center;
}

.quick-jump .form-label {
  margin-bottom: 0;
  font-size: 0.875rem;
  color: #6c757d;
}

/* Size variants */
.pagination-sm .page-link {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

.pagination-lg .page-link {
  padding: 0.75rem 1.5rem;
  font-size: 1.125rem;
}

/* Responsive */
@media (max-width: 768px) {
  .pagination-container {
    padding: 0.75rem;
  }
  
  .pagination-info {
    flex-direction: column;
    align-items: stretch;
    text-align: center;
  }
  
  .page-size-selector {
    justify-content: center;
  }
  
  .pagination {
    justify-content: center;
  }
  
  .quick-jump {
    justify-content: center;
  }
}

@media (max-width: 576px) {
  .pagination-sm .page-link {
    padding: 0.25rem 0.375rem;
    font-size: 0.75rem;
  }
  
  /* Hide page numbers on very small screens, keep only navigation */
  .pagination .page-item:not(:first-child):not(:nth-child(2)):not(:nth-last-child(2)):not(:last-child) {
    display: none;
  }
}
</style>