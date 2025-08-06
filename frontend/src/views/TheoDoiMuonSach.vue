<template>
  <div class="container-fluid">
    <DataTable
      title="Quản lý mượn trả sách"
      :data="filteredRecords"
      :columns="columns"
      :loading="loading"
      :searchable="true"
      search-placeholder="Tìm kiếm theo mã, độc giả, sách..."
      :actions="['view', 'edit', 'delete']"
      @search="handleSearch"
      @action="handleAction"
    >
      <template #actions>
        <div class="d-flex gap-2">
          <select class="form-select form-select-sm" v-model="statusFilter" @change="handleStatusFilter">
            <option value="">Tất cả trạng thái</option>
            <option value="Đang mượn">Đang mượn</option>
            <option value="Đã trả">Đã trả</option>
            <option value="Quá hạn">Quá hạn</option>
          </select>
          <button class="btn btn-primary" @click="showBorrowModal">
            <i class="bi bi-plus-circle me-2"></i>Mượn sách
          </button>
        </div>
      </template>

      <template #column-TrangThai="{ value }">
        <span :class="getStatusBadgeClass(value)">{{ value }}</span>
      </template>

      <template #column-NgayMuon="{ value }">
        {{ formatDate(value) }}
      </template>

      <template #column-NgayHenTra="{ value }">
        {{ formatDate(value) }}
      </template>

      <template #column-NgayTra="{ value }">
        {{ value ? formatDate(value) : '-' }}
      </template>
    </DataTable>



    <!-- Borrow Modal -->
    <div class="modal fade" :class="{ show: showBorrowModalState }" :style="{ display: showBorrowModalState ? 'block' : 'none' }"
      tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-journal-plus me-2"></i>Mượn sách
            </h5>
            <button type="button" class="btn-close" @click="closeBorrowModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="borrowBook">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="docGia" class="form-label">Độc giả <span class="text-danger">*</span></label>
                    <select class="form-select" id="docGia" v-model="borrowForm.MaDocGia"
                      :class="{ 'is-invalid': borrowErrors.MaDocGia }">
                      <option value="">Chọn độc giả</option>
                      <option v-for="docgia in docGiaList" :key="docgia.MaDocGia" :value="docgia.MaDocGia">
                        {{ docgia.HoLot }} {{ docgia.Ten }} ({{ docgia.MaDocGia }})
                      </option>
                    </select>
                    <div class="invalid-feedback" v-if="borrowErrors.MaDocGia">{{ borrowErrors.MaDocGia }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="sach" class="form-label">Sách <span class="text-danger">*</span></label>
                    <select class="form-select" id="sach" v-model="borrowForm.MaSach"
                      :class="{ 'is-invalid': borrowErrors.MaSach }">
                      <option value="">Chọn sách</option>
                      <option v-for="sach in availableBooks" :key="sach.MaSach" :value="sach.MaSach">
                        {{ sach.TenSach }} ({{ sach.MaSach }}) - Còn: {{ sach.SoQuyen }}
                      </option>
                    </select>
                    <div class="invalid-feedback" v-if="borrowErrors.MaSach">{{ borrowErrors.MaSach }}</div>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="ngayHenTra" class="form-label">Ngày hẹn trả <span class="text-danger">*</span></label>
                    <input type="date" class="form-control" id="ngayHenTra" v-model="borrowForm.NgayHenTra"
                      :class="{ 'is-invalid': borrowErrors.NgayHenTra }" :min="tomorrow">
                    <div class="invalid-feedback" v-if="borrowErrors.NgayHenTra">{{ borrowErrors.NgayHenTra }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="nhanVienMuon" class="form-label">Nhân viên xử lý <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="nhanVienMuon" v-model="borrowForm.NhanVienMuon"
                      :class="{ 'is-invalid': borrowErrors.NhanVienMuon }" placeholder="Mã nhân viên">
                    <div class="invalid-feedback" v-if="borrowErrors.NhanVienMuon">{{ borrowErrors.NhanVienMuon }}</div>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="ghiChu" class="form-label">Ghi chú</label>
                <textarea class="form-control" id="ghiChu" v-model="borrowForm.GhiChu" rows="3"
                  placeholder="Ghi chú thêm (tùy chọn)"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeBorrowModal">
              <i class="bi bi-x-circle me-2"></i>Hủy
            </button>
            <button type="button" class="btn btn-primary" @click="borrowBook" :disabled="borrowing">
              <span v-if="borrowing" class="spinner-border spinner-border-sm me-2"></span>
              <i class="bi bi-check-circle me-2" v-else></i>
              Mượn sách
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Return Modal -->
    <div class="modal fade" :class="{ show: showReturnModalState }" :style="{ display: showReturnModalState ? 'block' : 'none' }"
      tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-success">
              <i class="bi bi-check-circle me-2"></i>Trả sách
            </h5>
            <button type="button" class="btn-close" @click="closeReturnModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="returningRecord">
              <p><strong>Độc giả:</strong> {{ getReaderName(returningRecord) }}</p>
              <p><strong>Sách:</strong> {{ getBookTitle(returningRecord) }}</p>
              <p><strong>Ngày mượn:</strong> {{ formatDate(returningRecord.NgayMuon) }}</p>
              <p><strong>Ngày hẹn trả:</strong> {{ formatDate(returningRecord.NgayHenTra) }}</p>
              
              <div class="mb-3">
                <label for="nhanVienTra" class="form-label">Nhân viên xử lý <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="nhanVienTra" v-model="returnForm.NhanVienTra"
                  :class="{ 'is-invalid': returnErrors.NhanVienTra }" placeholder="Mã nhân viên">
                <div class="invalid-feedback" v-if="returnErrors.NhanVienTra">{{ returnErrors.NhanVienTra }}</div>
              </div>

              <div class="mb-3">
                <label for="ghiChuTra" class="form-label">Ghi chú</label>
                <textarea class="form-control" id="ghiChuTra" v-model="returnForm.GhiChu" rows="3"
                  placeholder="Ghi chú về tình trạng sách khi trả (tùy chọn)"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeReturnModal">
              <i class="bi bi-x-circle me-2"></i>Hủy
            </button>
            <button type="button" class="btn btn-success" @click="returnBook" :disabled="returning">
              <span v-if="returning" class="spinner-border spinner-border-sm me-2"></span>
              <i class="bi bi-check-circle me-2" v-else></i>
              Xác nhận trả
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Extend Modal -->
    <div class="modal fade" :class="{ show: showExtendModalState }" :style="{ display: showExtendModalState ? 'block' : 'none' }"
      tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-warning">
              <i class="bi bi-calendar-plus me-2"></i>Gia hạn sách
            </h5>
            <button type="button" class="btn-close" @click="closeExtendModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="extendingRecord">
              <p><strong>Độc giả:</strong> {{ getReaderName(extendingRecord) }}</p>
              <p><strong>Sách:</strong> {{ getBookTitle(extendingRecord) }}</p>
              <p><strong>Ngày hẹn trả hiện tại:</strong> {{ formatDate(extendingRecord.NgayHenTra) }}</p>
              
              <div class="mb-3">
                <label for="ngayHenTraMoi" class="form-label">Ngày hẹn trả mới <span class="text-danger">*</span></label>
                <input type="date" class="form-control" id="ngayHenTraMoi" v-model="extendForm.NgayHenTra"
                  :class="{ 'is-invalid': extendErrors.NgayHenTra }" :min="tomorrow">
                <div class="invalid-feedback" v-if="extendErrors.NgayHenTra">{{ extendErrors.NgayHenTra }}</div>
              </div>

              <div class="mb-3">
                <label for="ghiChuGiaHan" class="form-label">Ghi chú</label>
                <textarea class="form-control" id="ghiChuGiaHan" v-model="extendForm.GhiChu" rows="3"
                  placeholder="Lý do gia hạn (tùy chọn)"></textarea>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeExtendModal">
              <i class="bi bi-x-circle me-2"></i>Hủy
            </button>
            <button type="button" class="btn btn-warning" @click="extendDueDate" :disabled="extending">
              <span v-if="extending" class="spinner-border spinner-border-sm me-2"></span>
              <i class="bi bi-calendar-plus me-2" v-else></i>
              Gia hạn
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div class="modal-backdrop fade show" v-if="showBorrowModalState || showReturnModalState || showExtendModalState"></div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../utils/axios.js'
import DataTable from '../components/DataTable.vue'
import Modal from '../components/Modal.vue'

// Reactive data
const recordsList = ref([])
const docGiaList = ref([])
const sachList = ref([])
const loading = ref(false)
const borrowing = ref(false)
const returning = ref(false)
const extending = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Modal states
const showBorrowModalState = ref(false)
const showReturnModalState = ref(false)
const showExtendModalState = ref(false)
const returningRecord = ref(null)
const extendingRecord = ref(null)

// Form data
const borrowForm = ref({
  MaDocGia: '',
  MaSach: '',
  NgayHenTra: '',
  GhiChu: '',
  NhanVienMuon: 'NV001' // Default staff ID
})

const returnForm = ref({
  NhanVienTra: 'NV001', // Default staff ID
  GhiChu: ''
})

const extendForm = ref({
  NgayHenTra: '',
  GhiChu: ''
})

// Form errors
const borrowErrors = ref({})
const returnErrors = ref({})
const extendErrors = ref({})

// Table columns
const columns = ref([
  {
    key: 'MaTheoDoiMuonSach',
    title: 'Mã theo dõi',
    sortable: true,
    width: '120px'
  },
  {
    key: 'DocGia',
    title: 'Độc giả',
    sortable: true,
    formatter: (value, item) => {
      if (typeof value === 'object' && value !== null) {
        return `${value.HoLot} ${value.Ten}`.trim()
      }
      return value || '-'
    }
  },
  {
    key: 'Sach',
    title: 'Sách',
    sortable: true,
    formatter: (value, item) => {
      if (typeof value === 'object' && value !== null) {
        return value.TenSach || '-'
      }
      return value || '-'
    }
  },
  {
    key: 'NgayMuon',
    title: 'Ngày mượn',
    type: 'date',
    sortable: true,
    width: '120px'
  },
  {
    key: 'NgayHenTra',
    title: 'Ngày hẹn trả',
    type: 'date',
    sortable: true,
    width: '120px'
  },
  {
    key: 'NgayTra',
    title: 'Ngày trả',
    type: 'date',
    sortable: true,
    width: '120px'
  },
  {
    key: 'TrangThai',
    title: 'Trạng thái',
    type: 'badge',
    sortable: true,
    width: '120px',
    badgeMap: {
      'Đang mượn': 'badge-info',
      'Đã trả': 'badge-success',
      'Quá hạn': 'badge-danger'
    }
  }
])

// Computed properties
const filteredRecords = computed(() => {
  if (!Array.isArray(recordsList.value)) return []
  
  let filtered = recordsList.value

  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase().trim()
    filtered = filtered.filter(record =>
      record.MaTheoDoiMuonSach.toLowerCase().includes(query) ||
      record.MaDocGia.toLowerCase().includes(query) ||
      record.MaSach.toLowerCase().includes(query) ||
      getReaderName(record).toLowerCase().includes(query) ||
      getBookTitle(record).toLowerCase().includes(query)
    )
  }

  // Filter by status
  if (statusFilter.value) {
    filtered = filtered.filter(record => record.TrangThai === statusFilter.value)
  }

  return filtered
})

const totalPages = computed(() => {
  if (!Array.isArray(filteredRecords.value)) return 0
  return Math.ceil(filteredRecords.value.length / itemsPerPage.value)
})

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => {
  if (!Array.isArray(filteredRecords.value)) return 0
  return Math.min(startIndex.value + itemsPerPage.value, filteredRecords.value.length)
})

const paginatedRecords = computed(() => {
  if (!Array.isArray(filteredRecords.value)) return []
  return filteredRecords.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const availableBooks = computed(() => {
  return sachList.value.filter(sach => sach.SoQuyen > 0)
})

const tomorrow = computed(() => {
  const date = new Date()
  date.setDate(date.getDate() + 1)
  return date.toISOString().split('T')[0]
})

// Methods
const loadRecords = async () => {
  loading.value = true

  try {
    const response = await api.get('/theodoimuonsach')
    const apiData = response.data.data?.theodoimuonsach || response.data.data || []

    if (Array.isArray(apiData) && apiData.length > 0) {
      recordsList.value = apiData
    } else {
      console.log('API returned empty or invalid data, using mock data')

    }
  } catch (error) {
    console.error('Error loading records from API:', error)
    console.log('Using mock data as fallback')

  } finally {
    loading.value = false
    if (!Array.isArray(recordsList.value) || recordsList.value.length === 0) {

    }
  }
}

const loadDocGia = async () => {
  const mockDocGia = [
    { MaDocGia: 'DG001', HoLot: 'Nguyễn Văn', Ten: 'An' },
    { MaDocGia: 'DG002', HoLot: 'Trần Thị', Ten: 'Bình' },
    { MaDocGia: 'DG003', HoLot: 'Lê Văn', Ten: 'Cường' },
    { MaDocGia: 'DG004', HoLot: 'Phạm Thị', Ten: 'Dung' },
    { MaDocGia: 'DG005', HoLot: 'Hoàng Văn', Ten: 'Em' }
  ]

  try {
    const response = await api.get('/docgia')
    const apiData = response.data.data?.docgia || response.data.data || []
    
    if (Array.isArray(apiData) && apiData.length > 0) {
      docGiaList.value = apiData
    } else {
      docGiaList.value = mockDocGia
    }
  } catch (error) {
    console.error('Error loading doc gia:', error)
    docGiaList.value = mockDocGia
  }
}

const loadSach = async () => {
  const mockSach = [
    { MaSach: 'S001', TenSach: 'Lập trình JavaScript', SoQuyen: 10 },
    { MaSach: 'S002', TenSach: 'Cơ sở dữ liệu', SoQuyen: 8 },
    { MaSach: 'S003', TenSach: 'Mạng máy tính', SoQuyen: 12 },
    { MaSach: 'S004', TenSach: 'Thuật toán và cấu trúc dữ liệu', SoQuyen: 15 },
    { MaSach: 'S005', TenSach: 'Hệ điều hành Linux', SoQuyen: 6 }
  ]

  try {
    const response = await api.get('/sach/available')
    const apiData = response.data.data?.sach || response.data.data || []
    
    if (Array.isArray(apiData) && apiData.length > 0) {
      sachList.value = apiData
    } else {
      sachList.value = mockSach
    }
  } catch (error) {
    console.error('Error loading sach:', error)
    sachList.value = mockSach
  }
}

const handleSearch = (query) => {
  searchQuery.value = query
  currentPage.value = 1
}

const handleStatusFilter = () => {
  currentPage.value = 1
}

const handleAction = ({ action, item }) => {
  switch (action) {
    case 'view':
      viewRecord(item)
      break
    case 'edit':
      editRecord(item)
      break
    case 'delete':
      // For borrow records, we don't delete but return books
      if (item.TrangThai === 'Đang mượn') {
        showReturnModal(item)
      }
      break
  }
}

const viewRecord = (record) => {
  // For now, just edit the record. Later can implement a view-only modal
  editRecord(record)
}

const editRecord = (record) => {
  if (record.TrangThai === 'Đang mượn') {
    showExtendModal(record)
  }
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('vi-VN')
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'Đang mượn': 'badge badge-info',
    'Đã trả': 'badge badge-success',
    'Quá hạn': 'badge badge-danger'
  }
  return classes[status] || 'badge badge-secondary'
}

const clearSearch = () => {
  searchQuery.value = ''
  statusFilter.value = ''
  currentPage.value = 1
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

// Helper methods
const getReaderName = (record) => {
  if (record.MaDocGia && typeof record.MaDocGia === 'object') {
    return `${record.MaDocGia.HoLot} ${record.MaDocGia.Ten}`
  }
  // Fallback for string MaDocGia
  const docgia = docGiaList.value.find(d => d.MaDocGia === record.MaDocGia)
  return docgia ? `${docgia.HoLot} ${docgia.Ten}` : record.MaDocGia
}

const getBookTitle = (record) => {
  if (record.MaSach && typeof record.MaSach === 'object') {
    return record.MaSach.TenSach
  }
  // Fallback for string MaSach
  const sach = sachList.value.find(s => s.MaSach === record.MaSach)
  return sach ? sach.TenSach : record.MaSach
}



const getDueDateClass = (record) => {
  if (record.TrangThai === 'Đã trả') return ''
  
  const today = new Date()
  const dueDate = new Date(record.NgayHenTra)
  
  if (dueDate < today) {
    return 'text-danger fw-bold'
  } else if (dueDate.getTime() - today.getTime() <= 3 * 24 * 60 * 60 * 1000) {
    return 'text-warning fw-bold'
  }
  return ''
}

const getStatusClass = (status) => {
  switch (status) {
    case 'Đang mượn': return 'bg-primary'
    case 'Đã trả': return 'bg-success'
    case 'Quá hạn': return 'bg-danger'
    default: return 'bg-secondary'
  }
}

// Modal methods
const showBorrowModal = () => {
  resetBorrowForm()
  showBorrowModalState.value = true
}

const closeBorrowModal = () => {
  showBorrowModalState.value = false
  resetBorrowForm()
}

const resetBorrowForm = () => {
  borrowForm.value = {
    MaDocGia: '',
    MaSach: '',
    NgayHenTra: '',
    GhiChu: '',
    NhanVienMuon: 'NV001'
  }
  borrowErrors.value = {}
}

const validateBorrowForm = () => {
  borrowErrors.value = {}

  if (!borrowForm.value.MaDocGia) {
    borrowErrors.value.MaDocGia = 'Vui lòng chọn độc giả'
  }

  if (!borrowForm.value.MaSach) {
    borrowErrors.value.MaSach = 'Vui lòng chọn sách'
  }

  if (!borrowForm.value.NgayHenTra) {
    borrowErrors.value.NgayHenTra = 'Vui lòng chọn ngày hẹn trả'
  } else {
    const dueDate = new Date(borrowForm.value.NgayHenTra)
    const today = new Date()
    if (dueDate <= today) {
      borrowErrors.value.NgayHenTra = 'Ngày hẹn trả phải sau ngày hôm nay'
    }
  }

  if (!borrowForm.value.NhanVienMuon) {
    borrowErrors.value.NhanVienMuon = 'Vui lòng nhập mã nhân viên'
  }

  return Object.keys(borrowErrors.value).length === 0
}

const borrowBook = async () => {
  if (!validateBorrowForm()) return

  borrowing.value = true
  try {
    await api.post('/theodoimuonsach/muon', borrowForm.value)
    closeBorrowModal()
    await loadRecords()
    console.log('Mượn sách thành công')
  } catch (error) {
    console.error('Error borrowing book:', error)
    if (error.response?.data?.errors) {
      borrowErrors.value = error.response.data.errors
    }
  } finally {
    borrowing.value = false
  }
}

const showReturnModal = (record) => {
  returningRecord.value = record
  returnForm.value = {
    NhanVienTra: 'NV001',
    GhiChu: ''
  }
  returnErrors.value = {}
  showReturnModalState.value = true
}

const closeReturnModal = () => {
  showReturnModalState.value = false
  returningRecord.value = null
  returnForm.value = { NhanVienTra: 'NV001', GhiChu: '' }
  returnErrors.value = {}
}

const validateReturnForm = () => {
  returnErrors.value = {}

  if (!returnForm.value.NhanVienTra) {
    returnErrors.value.NhanVienTra = 'Vui lòng nhập mã nhân viên'
  }

  return Object.keys(returnErrors.value).length === 0
}

const returnBook = async () => {
  if (!validateReturnForm()) return

  returning.value = true
  try {
    await api.put(`/theodoimuonsach/${returningRecord.value.MaTheoDoiMuonSach}/tra`, returnForm.value)
    closeReturnModal()
    await loadRecords()
    console.log('Trả sách thành công')
  } catch (error) {
    console.error('Error returning book:', error)
    if (error.response?.data?.errors) {
      returnErrors.value = error.response.data.errors
    }
  } finally {
    returning.value = false
  }
}

const showExtendModal = (record) => {
  extendingRecord.value = record
  extendForm.value = {
    NgayHenTra: '',
    GhiChu: ''
  }
  extendErrors.value = {}
  showExtendModalState.value = true
}

const closeExtendModal = () => {
  showExtendModalState.value = false
  extendingRecord.value = null
  extendForm.value = { NgayHenTra: '', GhiChu: '' }
  extendErrors.value = {}
}

const validateExtendForm = () => {
  extendErrors.value = {}

  if (!extendForm.value.NgayHenTra) {
    extendErrors.value.NgayHenTra = 'Vui lòng chọn ngày hẹn trả mới'
  } else {
    const newDueDate = new Date(extendForm.value.NgayHenTra)
    const currentDueDate = new Date(extendingRecord.value.NgayHenTra)
    if (newDueDate <= currentDueDate) {
      extendErrors.value.NgayHenTra = 'Ngày hẹn trả mới phải sau ngày hẹn trả hiện tại'
    }
  }

  return Object.keys(extendErrors.value).length === 0
}

const extendDueDate = async () => {
  if (!validateExtendForm()) return

  extending.value = true
  try {
    await api.put(`/theodoimuonsach/${extendingRecord.value.MaTheoDoiMuonSach}/giahan`, extendForm.value)
    closeExtendModal()
    await loadRecords()
    console.log('Gia hạn sách thành công')
  } catch (error) {
    console.error('Error extending due date:', error)
    if (error.response?.data?.errors) {
      extendErrors.value = error.response.data.errors
    }
  } finally {
    extending.value = false
  }
}

const viewDetails = (record) => {
  // TODO: Implement view details functionality
  console.log('View details for:', record)
}

// Watch for search changes
watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  loadRecords()
  loadDocGia()
  loadSach()
})
</script>

<style scoped>
@import '@/assets/styles/main.css';

.card {
  border: none;
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #5a5c69;
  background-color: #f8f9fc;
}

.badge {
  font-size: 0.75rem;
}

.btn-group .btn {
  padding: 0.25rem 0.5rem;
}

.modal-backdrop {
  background-color: rgba(0, 0, 0, 0.5);
}

.text-truncate {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pagination .page-link {
  border-radius: 0.35rem;
  margin: 0 0.125rem;
  border: 1px solid #e3e6f0;
  color: #5a5c69;
}

.pagination .page-item.active .page-link {
  background-color: #4e73df;
  border-color: #4e73df;
}

.form-control:focus,
.form-select:focus {
  border-color: #bac8f3;
  box-shadow: 0 0 0 0.2rem rgba(78, 115, 223, 0.25);
}

.is-invalid {
  border-color: #e74a3b;
}

.invalid-feedback {
  display: block;
}

@media (max-width: 768px) {
  .table-responsive {
    font-size: 0.875rem;
  }

  .btn-group .btn {
    padding: 0.125rem 0.25rem;
  }

  .modal-dialog {
    margin: 0.5rem;
  }
}
</style>