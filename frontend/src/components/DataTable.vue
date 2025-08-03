<template>
  <div class="data-table-container">
    <!-- Table Header with Search and Actions -->
    <div class="table-header" v-if="showHeader">
      <div class="table-title">
        <h5 class="mb-0">{{ title }}</h5>
        <small v-if="subtitle" class="text-muted">{{ subtitle }}</small>
      </div>
      <div class="table-actions">
        <SearchBox
          v-if="searchable"
          v-model="searchQuery"
          :placeholder="searchPlaceholder"
          @search="handleSearch"
        />
        <slot name="actions"></slot>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="table-loading">
      <div class="d-flex justify-content-center align-items-center py-5">
        <div class="spinner-border text-primary" role="status">
          <span class="sr-only">Đang tải...</span>
        </div>
        <span class="ms-2">{{ loadingText }}</span>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else-if="!loading && (!data || data.length === 0)" class="table-empty">
      <div class="text-center py-5">
        <i class="bi bi-inbox display-1 text-muted"></i>
        <h5 class="mt-3 text-muted">{{ emptyText }}</h5>
        <p class="text-muted">{{ emptySubtext }}</p>
        <slot name="empty-actions"></slot>
      </div>
    </div>

    <!-- Data Table -->
    <div v-else class="table-responsive">
      <table class="table table-hover" :class="tableClasses">
        <thead :class="headerClass">
          <tr>
            <th v-if="selectable" class="select-column">
              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  :checked="allSelected"
                  @change="toggleSelectAll"
                  :indeterminate.prop="someSelected"
                >
              </div>
            </th>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="getColumnClass(column)"
              @click="handleSort(column)"
            >
              <div class="d-flex align-items-center">
                <span>{{ column.title }}</span>
                <i
                  v-if="column.sortable"
                  class="bi ms-1"
                  :class="getSortIcon(column.key)"
                ></i>
              </div>
            </th>
            <th v-if="hasActions" class="actions-column">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(item, index) in paginatedData"
            :key="getRowKey(item, index)"
            :class="getRowClass(item, index)"
            @click="handleRowClick(item, index)"
          >
            <td v-if="selectable" class="select-column">
              <div class="form-check">
                <input
                  type="checkbox"
                  class="form-check-input"
                  :checked="isSelected(item)"
                  @change="toggleSelect(item)"
                  @click.stop
                >
              </div>
            </td>
            <td
              v-for="column in columns"
              :key="column.key"
              :class="getColumnClass(column)"
            >
              <slot
                :name="`column-${column.key}`"
                :item="item"
                :value="getColumnValue(item, column.key)"
                :index="index"
              >
                <span v-if="column.type === 'badge'" :class="getBadgeClass(item, column)">
                  {{ formatColumnValue(item, column) }}
                </span>
                <span v-else-if="column.type === 'currency'" class="text-success fw-bold">
                  {{ formatCurrency(getColumnValue(item, column.key)) }}
                </span>
                <span v-else-if="column.type === 'date'">
                  {{ formatDate(getColumnValue(item, column.key)) }}
                </span>
                <span v-else-if="column.type === 'boolean'">
                  <i :class="getColumnValue(item, column.key) ? 'bi bi-check-circle text-success' : 'bi bi-x-circle text-danger'"></i>
                </span>
                <span v-else>
                  {{ formatColumnValue(item, column) }}
                </span>
              </slot>
            </td>
            <td v-if="hasActions" class="actions-column">
              <slot name="actions" :item="item" :index="index">
                <div class="btn-group btn-group-sm">
                  <button
                    v-if="actions.includes('view')"
                    class="btn btn-outline-info"
                    @click.stop="handleAction('view', item)"
                    title="Xem chi tiết"
                  >
                    <i class="bi bi-eye"></i>
                  </button>
                  <button
                    v-if="actions.includes('edit')"
                    class="btn btn-outline-primary"
                    @click.stop="handleAction('edit', item)"
                    title="Chỉnh sửa"
                  >
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button
                    v-if="actions.includes('delete')"
                    class="btn btn-outline-danger"
                    @click.stop="handleAction('delete', item)"
                    title="Xóa"
                  >
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <Pagination
      v-if="paginated && !loading && data && data.length > 0"
      v-model:current-page="currentPage"
      :total-items="totalItems"
      :items-per-page="itemsPerPage"
      :show-size-changer="showSizeChanger"
      @page-change="handlePageChange"
      @size-change="handleSizeChange"
    />
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import SearchBox from './SearchBox.vue'
import Pagination from './Pagination.vue'

const props = defineProps({
  // Data
  data: {
    type: Array,
    default: () => []
  },
  columns: {
    type: Array,
    required: true
  },
  
  // Table settings
  title: String,
  subtitle: String,
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: 'Đang tải dữ liệu...'
  },
  emptyText: {
    type: String,
    default: 'Không có dữ liệu'
  },
  emptySubtext: {
    type: String,
    default: 'Chưa có dữ liệu để hiển thị'
  },
  
  // Table styling
  striped: {
    type: Boolean,
    default: true
  },
  bordered: {
    type: Boolean,
    default: false
  },
  hover: {
    type: Boolean,
    default: true
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['sm', 'md', 'lg'].includes(value)
  },
  headerClass: {
    type: String,
    default: 'table-dark'
  },
  
  // Features
  searchable: {
    type: Boolean,
    default: true
  },
  searchPlaceholder: {
    type: String,
    default: 'Tìm kiếm...'
  },
  sortable: {
    type: Boolean,
    default: true
  },
  selectable: {
    type: Boolean,
    default: false
  },
  paginated: {
    type: Boolean,
    default: true
  },
  itemsPerPage: {
    type: Number,
    default: 10
  },
  showSizeChanger: {
    type: Boolean,
    default: true
  },
  showHeader: {
    type: Boolean,
    default: true
  },
  
  // Actions
  actions: {
    type: Array,
    default: () => ['view', 'edit', 'delete']
  },
  
  // Row settings
  rowKey: {
    type: [String, Function],
    default: 'id'
  },
  clickableRows: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits([
  'search',
  'sort',
  'row-click',
  'action',
  'select',
  'select-all',
  'page-change',
  'size-change'
])

// Reactive data
const searchQuery = ref('')
const sortField = ref('')
const sortOrder = ref('asc')
const currentPage = ref(1)
const selectedItems = ref([])

// Computed properties
const tableClasses = computed(() => {
  const classes = []
  if (props.striped) classes.push('table-striped')
  if (props.bordered) classes.push('table-bordered')
  if (props.hover) classes.push('table-hover')
  if (props.size === 'sm') classes.push('table-sm')
  return classes.join(' ')
})

const hasActions = computed(() => {
  return props.actions && props.actions.length > 0
})

const filteredData = computed(() => {
  if (!searchQuery.value || !props.data) return props.data
  
  const query = searchQuery.value.toLowerCase()
  return props.data.filter(item => {
    return props.columns.some(column => {
      const value = getColumnValue(item, column.key)
      return String(value).toLowerCase().includes(query)
    })
  })
})

const sortedData = computed(() => {
  if (!sortField.value || !props.sortable) return filteredData.value
  
  return [...filteredData.value].sort((a, b) => {
    const aVal = getColumnValue(a, sortField.value)
    const bVal = getColumnValue(b, sortField.value)
    
    let result = 0
    if (aVal < bVal) result = -1
    else if (aVal > bVal) result = 1
    
    return sortOrder.value === 'desc' ? -result : result
  })
})

const paginatedData = computed(() => {
  if (!props.paginated) return sortedData.value
  
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return sortedData.value.slice(start, end)
})

const totalItems = computed(() => {
  return filteredData.value ? filteredData.value.length : 0
})

const allSelected = computed(() => {
  return selectedItems.value.length === paginatedData.value.length && paginatedData.value.length > 0
})

const someSelected = computed(() => {
  return selectedItems.value.length > 0 && selectedItems.value.length < paginatedData.value.length
})

// Methods
const getColumnValue = (item, key) => {
  return key.split('.').reduce((obj, k) => obj?.[k], item)
}

const formatColumnValue = (item, column) => {
  const value = getColumnValue(item, column.key)
  if (column.formatter && typeof column.formatter === 'function') {
    return column.formatter(value, item)
  }
  return value
}

const formatCurrency = (value) => {
  if (!value) return '0 ₫'
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(value)
}

const formatDate = (value) => {
  if (!value) return '-'
  return new Date(value).toLocaleDateString('vi-VN')
}

const getColumnClass = (column) => {
  const classes = []
  if (column.align) classes.push(`text-${column.align}`)
  if (column.width) classes.push(`w-${column.width}`)
  if (column.sortable && props.sortable) classes.push('sortable-column')
  if (column.class) classes.push(column.class)
  return classes.join(' ')
}

const getRowClass = (item, index) => {
  const classes = []
  if (props.clickableRows) classes.push('clickable-row')
  if (isSelected(item)) classes.push('selected-row')
  return classes.join(' ')
}

const getRowKey = (item, index) => {
  if (typeof props.rowKey === 'function') {
    return props.rowKey(item, index)
  }
  return getColumnValue(item, props.rowKey) || index
}

const getBadgeClass = (item, column) => {
  const value = getColumnValue(item, column.key)
  const badgeMap = column.badgeMap || {}
  return `badge ${badgeMap[value] || 'badge-secondary'}`
}

const getSortIcon = (key) => {
  if (sortField.value !== key) return 'bi-arrow-down-up'
  return sortOrder.value === 'asc' ? 'bi-arrow-up' : 'bi-arrow-down'
}

const isSelected = (item) => {
  const key = getRowKey(item)
  return selectedItems.value.some(selected => getRowKey(selected) === key)
}

// Event handlers
const handleSearch = (query) => {
  searchQuery.value = query
  currentPage.value = 1
  emit('search', query)
}

const handleSort = (column) => {
  if (!column.sortable || !props.sortable) return
  
  if (sortField.value === column.key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = column.key
    sortOrder.value = 'asc'
  }
  
  emit('sort', { field: sortField.value, order: sortOrder.value })
}

const handleRowClick = (item, index) => {
  if (props.clickableRows) {
    emit('row-click', item, index)
  }
}

const handleAction = (action, item) => {
  emit('action', { action, item })
}

const toggleSelect = (item) => {
  const key = getRowKey(item)
  const index = selectedItems.value.findIndex(selected => getRowKey(selected) === key)
  
  if (index > -1) {
    selectedItems.value.splice(index, 1)
  } else {
    selectedItems.value.push(item)
  }
  
  emit('select', selectedItems.value)
}

const toggleSelectAll = () => {
  if (allSelected.value) {
    selectedItems.value = []
  } else {
    selectedItems.value = [...paginatedData.value]
  }
  
  emit('select-all', selectedItems.value)
}

const handlePageChange = (page) => {
  currentPage.value = page
  emit('page-change', page)
}

const handleSizeChange = (size) => {
  currentPage.value = 1
  emit('size-change', size)
}

// Watch for external changes
watch(() => props.data, () => {
  currentPage.value = 1
  selectedItems.value = []
})
</script>

<style scoped>
.data-table-container {
  background: white;
  border-radius: 0.375rem;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  border-bottom: 1px solid #e3e6f0;
}

.table-title h5 {
  color: #5a5c69;
  font-weight: 600;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.table-loading,
.table-empty {
  padding: 2rem;
}

.table-responsive {
  border-radius: 0 0 0.375rem 0.375rem;
}

.table {
  margin-bottom: 0;
}

.table th {
  border-top: none;
  font-weight: 600;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.sortable-column {
  cursor: pointer;
  user-select: none;
}

.sortable-column:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.select-column {
  width: 40px;
  text-align: center;
}

.actions-column {
  width: 120px;
  text-align: center;
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  background-color: rgba(0, 0, 0, 0.075);
}

.selected-row {
  background-color: rgba(78, 115, 223, 0.1);
}

.badge {
  font-size: 0.75em;
  padding: 0.35em 0.65em;
  border-radius: 0.375rem;
}

.badge-primary {
  background-color: #4e73df;
  color: white;
}

.badge-success {
  background-color: #1cc88a;
  color: white;
}

.badge-warning {
  background-color: #f6c23e;
  color: white;
}

.badge-danger {
  background-color: #e74a3b;
  color: white;
}

.badge-secondary {
  background-color: #858796;
  color: white;
}

.btn-group-sm .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
}

@media (max-width: 768px) {
  .table-header {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
  
  .table-actions {
    justify-content: space-between;
  }
}
</style>