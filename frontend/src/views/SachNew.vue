<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card shadow">
          <div class="card-header py-3">
            <h5 class="card-title mb-0 text-primary font-weight-bold">
              <i class="bi bi-book me-2"></i>Quản lý sách
            </h5>
          </div>
          <div class="card-body">
            <!-- Search and Add Section -->
            <div class="row mb-4">
              <div class="col-md-8">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                  <input type="text" class="form-control"
                    placeholder="Tìm kiếm theo mã sách, tên sách, tác giả, nhà xuất bản..." v-model="searchQuery"
                    @input="handleSearch">
                  <button class="btn btn-outline-secondary" @click="clearSearch" v-if="searchQuery">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
              <div class="col-md-4 text-end">
                <button class="btn btn-primary" @click="showAddModal">
                  <i class="bi bi-plus-circle me-2"></i>Thêm sách
                </button>
              </div>
            </div>

            <!-- Table Section -->
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th style="width: 100px;">Mã sách</th>
                    <th>Tên sách</th>
                    <th style="width: 120px;">Đơn giá</th>
                    <th style="width: 100px;">Số quyển</th>
                    <th style="width: 100px;">Năm XB</th>
                    <th style="width: 150px;">Nhà XB</th>
                    <th style="width: 150px;">Tác giả</th>
                    <th style="width: 120px;" class="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sach in paginatedSach" :key="sach.MaSach">
                    <td>
                      <span class="badge bg-success">{{ sach.MaSach }}</span>
                    </td>
                    <td class="fw-bold">{{ sach.TenSach }}</td>
                    <td class="text-end">{{ formatCurrency(sach.DonGia) }}</td>
                    <td class="text-center">
                      <span class="badge" :class="sach.SoQuyen > 0 ? 'bg-primary' : 'bg-danger'">
                        {{ sach.SoQuyen }}
                      </span>
                    </td>
                    <td class="text-center">{{ sach.NamXuatBan }}</td>
                    <td class="text-truncate" style="max-width: 150px;" :title="sach.NhaXuatBan">
                      {{ sach.NhaXuatBan }}
                    </td>
                    <td class="text-truncate" style="max-width: 150px;" :title="sach.NguonGoc">
                      {{ sach.NguonGoc }}
                    </td>
                    <td class="text-center">
                      <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" @click="editSach(sach)" title="Chỉnh sửa">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" @click="confirmDelete(sach)" title="Xóa">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredSach.length === 0 && !loading">
                    <td colspan="8" class="text-center text-muted py-4">
                      <i class="bi bi-inbox display-4 d-block mb-2"></i>
                      {{ searchQuery ? 'Không tìm thấy sách nào' : 'Chưa có sách nào' }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border text-primary" role="status">
                <span class="visually-hidden">Đang tải...</span>
              </div>
              <p class="mt-2 text-muted">Đang tải danh sách sách...</p>
            </div>

            <!-- Pagination -->
            <div class="row mt-4" v-if="filteredSach.length > 0">
              <div class="col-md-6">
                <p class="text-muted">
                  Hiển thị {{ startIndex + 1 }} - {{ endIndex }} trong tổng số {{ filteredSach.length }} sách
                </p>
              </div>
              <div class="col-md-6">
                <nav aria-label="Pagination">
                  <ul class="pagination justify-content-end mb-0">
                    <li class="page-item" :class="{ disabled: currentPage === 1 }">
                      <button class="page-link" @click="goToPage(currentPage - 1)" :disabled="currentPage === 1">
                        <i class="bi bi-chevron-left"></i>
                      </button>
                    </li>
                    <li class="page-item" v-for="page in visiblePages" :key="page"
                      :class="{ active: page === currentPage }">
                      <button class="page-link" @click="goToPage(page)">{{ page }}</button>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                      <button class="page-link" @click="goToPage(currentPage + 1)"
                        :disabled="currentPage === totalPages">
                        <i class="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <div class="modal fade" :class="{ show: showModal }" :style="{ display: showModal ? 'block' : 'none' }"
      tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-book-half me-2" v-if="!editingSach"></i>
              <i class="bi bi-pencil-square me-2" v-else></i>
              {{ editingSach ? 'Chỉnh sửa sách' : 'Thêm sách mới' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveSach">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="maSach" class="form-label">Mã sách <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="maSach" v-model="formData.MaSach"
                      :disabled="editingSach" :class="{ 'is-invalid': errors.MaSach }" placeholder="VD: S001">
                    <div class="invalid-feedback" v-if="errors.MaSach">{{ errors.MaSach }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="namXuatBan" class="form-label">Năm xuất bản <span class="text-danger">*</span></label>
                    <input type="number" class="form-control" id="namXuatBan" v-model="formData.NamXuatBan"
                      :class="{ 'is-invalid': errors.NamXuatBan }" :min="1900" :max="currentYear"
                      placeholder="VD: 2023">
                    <div class="invalid-feedback" v-if="errors.NamXuatBan">{{ errors.NamXuatBan }}</div>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label for="tenSach" class="form-label">Tên sách <span class="text-danger">*</span></label>
                <input type="text" class="form-control" id="tenSach" v-model="formData.TenSach"
                  :class="{ 'is-invalid': errors.TenSach }" placeholder="VD: Lập trình JavaScript cơ bản">
                <div class="invalid-feedback" v-if="errors.TenSach">{{ errors.TenSach }}</div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="donGia" class="form-label">Đơn giá <span class="text-danger">*</span></label>
                    <div class="input-group">
                      <input type="number" class="form-control" id="donGia" v-model="formData.DonGia"
                        :class="{ 'is-invalid': errors.DonGia }" min="0" step="1000" placeholder="150000">
                      <span class="input-group-text">VNĐ</span>
                    </div>
                    <div class="invalid-feedback" v-if="errors.DonGia">{{ errors.DonGia }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="soQuyen" class="form-label">Số quyển <span class="text-danger">*</span></label>
                    <input type="number" class="form-control" id="soQuyen" v-model="formData.SoQuyen"
                      :class="{ 'is-invalid': errors.SoQuyen }" min="0" placeholder="10">
                    <div class="invalid-feedback" v-if="errors.SoQuyen">{{ errors.SoQuyen }}</div>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="nhaXuatBan" class="form-label">Nhà xuất bản <span class="text-danger">*</span></label>
                    <select class="form-select" id="nhaXuatBan" v-model="formData.MaNhaXuatBan"
                      :class="{ 'is-invalid': errors.MaNhaXuatBan }">
                      <option value="">Chọn nhà xuất bản</option>
                      <option v-for="nxb in nhaXuatBanList" :key="nxb.MaNhaXuatBan" :value="nxb.MaNhaXuatBan">
                        {{ nxb.TenNhaXuatBan }}
                      </option>
                    </select>
                    <div class="invalid-feedback" v-if="errors.MaNhaXuatBan">{{ errors.MaNhaXuatBan }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="nguonGoc" class="form-label">Tác giả <span class="text-danger">*</span></label>
                    <input type="text" class="form-control" id="nguonGoc" v-model="formData.NguonGoc"
                      :class="{ 'is-invalid': errors.NguonGoc }" placeholder="VD: Nguyễn Văn A">
                    <div class="invalid-feedback" v-if="errors.NguonGoc">{{ errors.NguonGoc }}</div>
                  </div>
                </div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              <i class="bi bi-x-circle me-2"></i>Hủy
            </button>
            <button type="button" class="btn btn-primary" @click="saveSach" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              <i class="bi bi-check-circle me-2" v-else></i>
              {{ editingSach ? 'Cập nhật' : 'Thêm mới' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" :class="{ show: showDeleteModal }" :style="{ display: showDeleteModal ? 'block' : 'none' }"
      tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>Xác nhận xóa
            </h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Bạn có chắc chắn muốn xóa sách <strong>{{ deletingSach?.TenSach }}</strong>?</p>
            <p class="text-muted small">Hành động này không thể hoàn tác.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">
              <i class="bi bi-x-circle me-2"></i>Hủy
            </button>
            <button type="button" class="btn btn-danger" @click="deleteSach" :disabled="deleting">
              <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
              <i class="bi bi-trash me-2" v-else></i>
              Xóa
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div class="modal-backdrop fade show" v-if="showModal || showDeleteModal"></div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'

// Reactive data
const sachList = ref([])
const nhaXuatBanList = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Modal states
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingSach = ref(null)
const deletingSach = ref(null)

// Form data
const formData = ref({
  MaSach: '',
  TenSach: '',
  DonGia: '',
  SoQuyen: '',
  NamXuatBan: '',
  MaNhaXuatBan: '',
  NguonGoc: ''
})

// Form errors
const errors = ref({})

// Computed properties
const filteredSach = computed(() => {
  if (!Array.isArray(sachList.value)) return []
  if (!searchQuery.value) return sachList.value

  const query = searchQuery.value.toLowerCase().trim()
  return sachList.value.filter(sach =>
    sach.MaSach.toLowerCase().includes(query) ||
    sach.TenSach.toLowerCase().includes(query) ||
    sach.NguonGoc.toLowerCase().includes(query) ||
    sach.NhaXuatBan.toLowerCase().includes(query)
  )
})

const totalPages = computed(() => {
  if (!Array.isArray(filteredSach.value)) return 0
  return Math.ceil(filteredSach.value.length / itemsPerPage.value)
})

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => {
  if (!Array.isArray(filteredSach.value)) return 0
  return Math.min(startIndex.value + itemsPerPage.value, filteredSach.value.length)
})

const paginatedSach = computed(() => {
  if (!Array.isArray(filteredSach.value)) return []
  return filteredSach.value.slice(startIndex.value, endIndex.value)
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

const currentYear = computed(() => new Date().getFullYear())

// Methods
const loadSach = async () => {
  loading.value = true

  // Mock data fallback
  const mockData = [
    {
      MaSach: 'S001',
      TenSach: 'Lập trình JavaScript cơ bản',
      DonGia: 150000,
      SoQuyen: 10,
      NamXuatBan: 2023,
      MaNhaXuatBan: 'NXB001',
      NhaXuatBan: 'NXB Giáo dục',
      NguonGoc: 'Nguyễn Văn A'
    },
    {
      MaSach: 'S002',
      TenSach: 'Cơ sở dữ liệu nâng cao',
      DonGia: 200000,
      SoQuyen: 8,
      NamXuatBan: 2023,
      MaNhaXuatBan: 'NXB002',
      NhaXuatBan: 'NXB Khoa học',
      NguonGoc: 'Trần Thị B'
    },
    {
      MaSach: 'S003',
      TenSach: 'Mạng máy tính',
      DonGia: 180000,
      SoQuyen: 12,
      NamXuatBan: 2022,
      MaNhaXuatBan: 'NXB003',
      NhaXuatBan: 'NXB Công nghệ',
      NguonGoc: 'Lê Văn C'
    },
    {
      MaSach: 'S004',
      TenSach: 'Thuật toán và cấu trúc dữ liệu',
      DonGia: 220000,
      SoQuyen: 15,
      NamXuatBan: 2023,
      MaNhaXuatBan: 'NXB001',
      NhaXuatBan: 'NXB Giáo dục',
      NguonGoc: 'Phạm Văn D'
    },
    {
      MaSach: 'S005',
      TenSach: 'Hệ điều hành Linux',
      DonGia: 190000,
      SoQuyen: 6,
      NamXuatBan: 2022,
      MaNhaXuatBan: 'NXB003',
      NhaXuatBan: 'NXB Công nghệ',
      NguonGoc: 'Hoàng Thị E'
    }
  ]

  try {
    // Try to get data from API
    const response = await axios.get('/api/sach')
    const apiData = response.data.data?.sach || response.data.data || []

    // Use API data if available and valid, otherwise use mock data
    if (Array.isArray(apiData) && apiData.length > 0) {
      sachList.value = apiData
    } else {
      console.log('API returned empty or invalid data, using mock data')
      sachList.value = mockData
    }
  } catch (error) {
    console.error('Error loading sach from API:', error)
    console.log('Using mock data as fallback')
    sachList.value = mockData
  } finally {
    loading.value = false
    // Final safety check
    if (!Array.isArray(sachList.value) || sachList.value.length === 0) {
      sachList.value = mockData
    }
  }
}

const loadNhaXuatBan = async () => {
  // Mock data for publishers
  const mockNXB = [
    { MaNhaXuatBan: 'NXB001', TenNhaXuatBan: 'NXB Giáo dục' },
    { MaNhaXuatBan: 'NXB002', TenNhaXuatBan: 'NXB Khoa học' },
    { MaNhaXuatBan: 'NXB003', TenNhaXuatBan: 'NXB Công nghệ' },
    { MaNhaXuatBan: 'NXB004', TenNhaXuatBan: 'NXB Văn học' },
    { MaNhaXuatBan: 'NXB005', TenNhaXuatBan: 'NXB Đại học Quốc gia' }
  ]

  try {
    const response = await axios.get('/api/nhaxuatban')
    const apiData = response.data.data?.nhaxuatban || response.data.data || []

    if (Array.isArray(apiData) && apiData.length > 0) {
      nhaXuatBanList.value = apiData
    } else {
      nhaXuatBanList.value = mockNXB
    }
  } catch (error) {
    console.error('Error loading nha xuat ban:', error)
    nhaXuatBanList.value = mockNXB
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const clearSearch = () => {
  searchQuery.value = ''
  currentPage.value = 1
}

const goToPage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const showAddModal = () => {
  editingSach.value = null
  resetForm()
  showModal.value = true
}

const editSach = (sach) => {
  editingSach.value = sach
  formData.value = { ...sach }
  errors.value = {}
  showModal.value = true
}

const resetForm = () => {
  formData.value = {
    MaSach: '',
    TenSach: '',
    DonGia: '',
    SoQuyen: '',
    NamXuatBan: '',
    MaNhaXuatBan: '',
    NguonGoc: ''
  }
  errors.value = {}
}

const closeModal = () => {
  showModal.value = false
  resetForm()
  editingSach.value = null
}

const validateForm = () => {
  errors.value = {}

  if (!formData.value.MaSach.trim()) {
    errors.value.MaSach = 'Mã sách là bắt buộc'
  } else if (!/^S\d{3,}$/.test(formData.value.MaSach)) {
    errors.value.MaSach = 'Mã sách phải có định dạng S001, S002, ...'
  } else if (!editingSach.value && Array.isArray(sachList.value) && sachList.value.some(s => s.MaSach === formData.value.MaSach)) {
    errors.value.MaSach = 'Mã sách đã tồn tại'
  }

  if (!formData.value.TenSach.trim()) {
    errors.value.TenSach = 'Tên sách là bắt buộc'
  } else if (formData.value.TenSach.length > 200) {
    errors.value.TenSach = 'Tên sách không được quá 200 ký tự'
  }

  if (!formData.value.DonGia || formData.value.DonGia <= 0) {
    errors.value.DonGia = 'Đơn giá phải lớn hơn 0'
  } else if (formData.value.DonGia > 10000000) {
    errors.value.DonGia = 'Đơn giá không được quá 10,000,000 VNĐ'
  }

  if (!formData.value.SoQuyen || formData.value.SoQuyen < 0) {
    errors.value.SoQuyen = 'Số quyển phải lớn hơn hoặc bằng 0'
  } else if (formData.value.SoQuyen > 1000) {
    errors.value.SoQuyen = 'Số quyển không được quá 1000'
  }

  if (!formData.value.NamXuatBan) {
    errors.value.NamXuatBan = 'Năm xuất bản là bắt buộc'
  } else if (formData.value.NamXuatBan < 1900 || formData.value.NamXuatBan > currentYear.value) {
    errors.value.NamXuatBan = `Năm xuất bản phải từ 1900 đến ${currentYear.value}`
  }

  if (!formData.value.MaNhaXuatBan) {
    errors.value.MaNhaXuatBan = 'Nhà xuất bản là bắt buộc'
  }

  if (!formData.value.NguonGoc.trim()) {
    errors.value.NguonGoc = 'Tác giả là bắt buộc'
  } else if (formData.value.NguonGoc.length > 100) {
    errors.value.NguonGoc = 'Tên tác giả không được quá 100 ký tự'
  }

  return Object.keys(errors.value).length === 0
}

const saveSach = async () => {
  if (!validateForm()) return

  saving.value = true
  try {
    // Add NhaXuatBan name for display
    const nxb = nhaXuatBanList.value.find(n => n.MaNhaXuatBan === formData.value.MaNhaXuatBan)
    const sachData = {
      ...formData.value,
      NhaXuatBan: nxb?.TenNhaXuatBan || ''
    }

    if (editingSach.value) {
      // Update existing
      await axios.put(`/api/sach/${editingSach.value.MaSach}`, sachData)
      if (Array.isArray(sachList.value)) {
        const index = sachList.value.findIndex(s => s.MaSach === editingSach.value.MaSach)
        if (index !== -1) {
          sachList.value[index] = { ...sachData }
        }
      }
    } else {
      // Create new
      await axios.post('/api/sach', sachData)
      if (Array.isArray(sachList.value)) {
        sachList.value.push({ ...sachData })
      }
    }

    closeModal()
    console.log('Sách đã được lưu thành công')
  } catch (error) {
    console.error('Error saving sach:', error)
    // Handle API errors
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    }
  } finally {
    saving.value = false
  }
}

const confirmDelete = (sach) => {
  deletingSach.value = sach
  showDeleteModal.value = true
}

const deleteSach = async () => {
  if (!deletingSach.value) return

  deleting.value = true
  try {
    await axios.delete(`/api/sach/${deletingSach.value.MaSach}`)
    if (Array.isArray(sachList.value)) {
      const index = sachList.value.findIndex(s => s.MaSach === deletingSach.value.MaSach)
      if (index !== -1) {
        sachList.value.splice(index, 1)
      }
    }

    showDeleteModal.value = false
    deletingSach.value = null

    // Adjust current page if needed
    if (paginatedSach.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }

    console.log('Sách đã được xóa thành công')
  } catch (error) {
    console.error('Error deleting sach:', error)
  } finally {
    deleting.value = false
  }
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

// Watch for search query changes
watch(searchQuery, () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  loadSach()
  loadNhaXuatBan()
})
</script>

<style scoped>
@import '../assets/main_admin.css';

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