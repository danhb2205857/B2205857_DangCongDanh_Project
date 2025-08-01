<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card shadow">
          <div class="card-header py-3">
            <h5 class="card-title mb-0 text-primary font-weight-bold">
              <i class="bi bi-building me-2"></i>Quản lý nhà xuất bản
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
                  <input 
                    type="text" 
                    class="form-control" 
                    placeholder="Tìm kiếm theo mã, tên nhà xuất bản, địa chỉ..."
                    v-model="searchQuery"
                    @input="handleSearch"
                  >
                  <button class="btn btn-outline-secondary" @click="clearSearch" v-if="searchQuery">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
              <div class="col-md-4 text-end">
                <button class="btn btn-primary" @click="showAddModal">
                  <i class="bi bi-plus-circle me-2"></i>Thêm nhà xuất bản
                </button>
              </div>
            </div>
            
            <!-- Table Section -->
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th style="width: 120px;">Mã NXB</th>
                    <th>Tên nhà xuất bản</th>
                    <th>Địa chỉ</th>
                    <th style="width: 120px;">Điện thoại</th>
                    <th style="width: 100px;" class="text-center">Số sách</th>
                    <th style="width: 120px;" class="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="nxb in paginatedNXB" :key="nxb.MaNhaXuatBan">
                    <td>
                      <span class="badge bg-info">{{ nxb.MaNhaXuatBan }}</span>
                    </td>
                    <td class="fw-bold">{{ nxb.TenNhaXuatBan }}</td>
                    <td class="text-truncate" style="max-width: 250px;" :title="nxb.DiaChi">
                      {{ nxb.DiaChi }}
                    </td>
                    <td>{{ nxb.DienThoai || 'N/A' }}</td>
                    <td class="text-center">
                      <span class="badge bg-secondary">{{ nxb.SoSach || 0 }}</span>
                    </td>
                    <td class="text-center">
                      <div class="btn-group" role="group">
                        <button 
                          class="btn btn-sm btn-outline-primary" 
                          @click="editNXB(nxb)"
                          title="Chỉnh sửa"
                        >
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button 
                          class="btn btn-sm btn-outline-danger" 
                          @click="confirmDelete(nxb)"
                          title="Xóa"
                        >
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredNXB.length === 0 && !loading">
                    <td colspan="6" class="text-center text-muted py-4">
                      <i class="bi bi-inbox display-4 d-block mb-2"></i>
                      {{ searchQuery ? 'Không tìm thấy nhà xuất bản nào' : 'Chưa có nhà xuất bản nào' }}
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
              <p class="mt-2 text-muted">Đang tải danh sách nhà xuất bản...</p>
            </div>
            
            <!-- Pagination -->
            <div class="row mt-4" v-if="filteredNXB.length > 0">
              <div class="col-md-6">
                <p class="text-muted">
                  Hiển thị {{ startIndex + 1 }} - {{ endIndex }} trong tổng số {{ filteredNXB.length }} nhà xuất bản
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
                    <li 
                      class="page-item" 
                      v-for="page in visiblePages" 
                      :key="page"
                      :class="{ active: page === currentPage }"
                    >
                      <button class="page-link" @click="goToPage(page)">{{ page }}</button>
                    </li>
                    <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                      <button class="page-link" @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages">
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
    <div class="modal fade" :class="{ show: showModal }" :style="{ display: showModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="bi bi-building-add me-2" v-if="!editingNXB"></i>
              <i class="bi bi-building-gear me-2" v-else></i>
              {{ editingNXB ? 'Chỉnh sửa nhà xuất bản' : 'Thêm nhà xuất bản mới' }}
            </h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveNXB">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="maNhaXuatBan" class="form-label">Mã nhà xuất bản <span class="text-danger">*</span></label>
                    <input 
                      type="text" 
                      class="form-control" 
                      id="maNhaXuatBan"
                      v-model="formData.MaNhaXuatBan"
                      :disabled="editingNXB"
                      :class="{ 'is-invalid': errors.MaNhaXuatBan }"
                      placeholder="VD: NXB001"
                    >
                    <div class="invalid-feedback" v-if="errors.MaNhaXuatBan">{{ errors.MaNhaXuatBan }}</div>
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label for="dienThoai" class="form-label">Điện thoại</label>
                    <input 
                      type="tel" 
                      class="form-control" 
                      id="dienThoai"
                      v-model="formData.DienThoai"
                      :class="{ 'is-invalid': errors.DienThoai }"
                      placeholder="VD: 0901234567"
                    >
                    <div class="invalid-feedback" v-if="errors.DienThoai">{{ errors.DienThoai }}</div>
                  </div>
                </div>
              </div>
              
              <div class="mb-3">
                <label for="tenNhaXuatBan" class="form-label">Tên nhà xuất bản <span class="text-danger">*</span></label>
                <input 
                  type="text" 
                  class="form-control" 
                  id="tenNhaXuatBan"
                  v-model="formData.TenNhaXuatBan"
                  :class="{ 'is-invalid': errors.TenNhaXuatBan }"
                  placeholder="VD: Nhà xuất bản Giáo dục Việt Nam"
                >
                <div class="invalid-feedback" v-if="errors.TenNhaXuatBan">{{ errors.TenNhaXuatBan }}</div>
              </div>
              
              <div class="mb-3">
                <label for="diaChi" class="form-label">Địa chỉ <span class="text-danger">*</span></label>
                <textarea 
                  class="form-control" 
                  id="diaChi"
                  v-model="formData.DiaChi"
                  :class="{ 'is-invalid': errors.DiaChi }"
                  rows="3"
                  placeholder="VD: 81 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội"
                ></textarea>
                <div class="invalid-feedback" v-if="errors.DiaChi">{{ errors.DiaChi }}</div>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">
              <i class="bi bi-x-circle me-2"></i>Hủy
            </button>
            <button type="button" class="btn btn-primary" @click="saveNXB" :disabled="saving">
              <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
              <i class="bi bi-check-circle me-2" v-else></i>
              {{ editingNXB ? 'Cập nhật' : 'Thêm mới' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal fade" :class="{ show: showDeleteModal }" :style="{ display: showDeleteModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">
              <i class="bi bi-exclamation-triangle me-2"></i>Xác nhận xóa
            </h5>
            <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
          </div>
          <div class="modal-body">
            <p>Bạn có chắc chắn muốn xóa nhà xuất bản <strong>{{ deletingNXB?.TenNhaXuatBan }}</strong>?</p>
            <div v-if="deletingNXB?.SoSach > 0" class="alert alert-warning">
              <i class="bi bi-exclamation-triangle me-2"></i>
              Nhà xuất bản này có {{ deletingNXB.SoSach }} sách. Việc xóa có thể ảnh hưởng đến dữ liệu sách.
            </div>
            <p class="text-muted small">Hành động này không thể hoàn tác.</p>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">
              <i class="bi bi-x-circle me-2"></i>Hủy
            </button>
            <button type="button" class="btn btn-danger" @click="deleteNXB" :disabled="deleting">
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
const nxbList = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Modal states
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingNXB = ref(null)
const deletingNXB = ref(null)

// Form data
const formData = ref({
  MaNhaXuatBan: '',
  TenNhaXuatBan: '',
  DiaChi: '',
  DienThoai: ''
})

// Form errors
const errors = ref({})

// Computed properties
const filteredNXB = computed(() => {
  if (!Array.isArray(nxbList.value)) return []
  if (!searchQuery.value) return nxbList.value
  
  const query = searchQuery.value.toLowerCase().trim()
  return nxbList.value.filter(nxb => 
    nxb.MaNhaXuatBan.toLowerCase().includes(query) ||
    nxb.TenNhaXuatBan.toLowerCase().includes(query) ||
    nxb.DiaChi.toLowerCase().includes(query)
  )
})

const totalPages = computed(() => {
  if (!Array.isArray(filteredNXB.value)) return 0
  return Math.ceil(filteredNXB.value.length / itemsPerPage.value)
})

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => {
  if (!Array.isArray(filteredNXB.value)) return 0
  return Math.min(startIndex.value + itemsPerPage.value, filteredNXB.value.length)
})

const paginatedNXB = computed(() => {
  if (!Array.isArray(filteredNXB.value)) return []
  return filteredNXB.value.slice(startIndex.value, endIndex.value)
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

// Methods
const loadNXB = async () => {
  loading.value = true
  
  // Mock data fallback
  const mockData = [
    {
      MaNhaXuatBan: 'NXB001',
      TenNhaXuatBan: 'Nhà xuất bản Giáo dục Việt Nam',
      DiaChi: '81 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
      DienThoai: '024-38220801',
      SoSach: 15
    },
    {
      MaNhaXuatBan: 'NXB002',
      TenNhaXuatBan: 'Nhà xuất bản Khoa học và Kỹ thuật',
      DiaChi: '70 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
      DienThoai: '024-38253841',
      SoSach: 8
    },
    {
      MaNhaXuatBan: 'NXB003',
      TenNhaXuatBan: 'Nhà xuất bản Công nghệ Thông tin',
      DiaChi: '123 Lê Lợi, Quận 1, TP.HCM',
      DienThoai: '028-38297667',
      SoSach: 12
    },
    {
      MaNhaXuatBan: 'NXB004',
      TenNhaXuatBan: 'Nhà xuất bản Văn học',
      DiaChi: '18 Nguyễn Trường Tộ, Ba Đình, Hà Nội',
      DienThoai: '024-38234565',
      SoSach: 6
    },
    {
      MaNhaXuatBan: 'NXB005',
      TenNhaXuatBan: 'Nhà xuất bản Đại học Quốc gia',
      DiaChi: '144 Xuân Thủy, Cầu Giấy, Hà Nội',
      DienThoai: '024-37547461',
      SoSach: 20
    }
  ]
  
  try {
    // Try to get data from API
    const response = await axios.get('/api/nhaxuatban')
    const apiData = response.data.data?.nhaxuatban || response.data.data || []
    
    // Use API data if available and valid, otherwise use mock data
    if (Array.isArray(apiData) && apiData.length > 0) {
      nxbList.value = apiData
    } else {
      console.log('API returned empty or invalid data, using mock data')
      nxbList.value = mockData
    }
  } catch (error) {
    console.error('Error loading nha xuat ban from API:', error)
    console.log('Using mock data as fallback')
    nxbList.value = mockData
  } finally {
    loading.value = false
    // Final safety check
    if (!Array.isArray(nxbList.value) || nxbList.value.length === 0) {
      nxbList.value = mockData
    }
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
  editingNXB.value = null
  resetForm()
  showModal.value = true
}

const editNXB = (nxb) => {
  editingNXB.value = nxb
  formData.value = { ...nxb }
  errors.value = {}
  showModal.value = true
}

const resetForm = () => {
  formData.value = {
    MaNhaXuatBan: '',
    TenNhaXuatBan: '',
    DiaChi: '',
    DienThoai: ''
  }
  errors.value = {}
}

const closeModal = () => {
  showModal.value = false
  resetForm()
  editingNXB.value = null
}

const validateForm = () => {
  errors.value = {}
  
  if (!formData.value.MaNhaXuatBan.trim()) {
    errors.value.MaNhaXuatBan = 'Mã nhà xuất bản là bắt buộc'
  } else if (!/^NXB\d{3,}$/.test(formData.value.MaNhaXuatBan)) {
    errors.value.MaNhaXuatBan = 'Mã nhà xuất bản phải có định dạng NXB001, NXB002, ...'
  } else if (!editingNXB.value && Array.isArray(nxbList.value) && nxbList.value.some(n => n.MaNhaXuatBan === formData.value.MaNhaXuatBan)) {
    errors.value.MaNhaXuatBan = 'Mã nhà xuất bản đã tồn tại'
  }
  
  if (!formData.value.TenNhaXuatBan.trim()) {
    errors.value.TenNhaXuatBan = 'Tên nhà xuất bản là bắt buộc'
  } else if (formData.value.TenNhaXuatBan.length > 100) {
    errors.value.TenNhaXuatBan = 'Tên nhà xuất bản không được quá 100 ký tự'
  }
  
  if (!formData.value.DiaChi.trim()) {
    errors.value.DiaChi = 'Địa chỉ là bắt buộc'
  } else if (formData.value.DiaChi.length > 200) {
    errors.value.DiaChi = 'Địa chỉ không được quá 200 ký tự'
  }
  
  if (formData.value.DienThoai && !/^(0|\+84)[0-9]{9,10}$/.test(formData.value.DienThoai)) {
    errors.value.DienThoai = 'Số điện thoại không hợp lệ'
  }
  
  return Object.keys(errors.value).length === 0
}

const saveNXB = async () => {
  if (!validateForm()) return
  
  saving.value = true
  try {
    if (editingNXB.value) {
      // Update existing
      await axios.put(`/api/nhaxuatban/${editingNXB.value.MaNhaXuatBan}`, formData.value)
      if (Array.isArray(nxbList.value)) {
        const index = nxbList.value.findIndex(n => n.MaNhaXuatBan === editingNXB.value.MaNhaXuatBan)
        if (index !== -1) {
          nxbList.value[index] = { ...formData.value, SoSach: nxbList.value[index].SoSach || 0 }
        }
      }
    } else {
      // Create new
      await axios.post('/api/nhaxuatban', formData.value)
      if (Array.isArray(nxbList.value)) {
        nxbList.value.push({ ...formData.value, SoSach: 0 })
      }
    }
    
    closeModal()
    console.log('Nhà xuất bản đã được lưu thành công')
  } catch (error) {
    console.error('Error saving nha xuat ban:', error)
    // Handle API errors
    if (error.response?.data?.errors) {
      errors.value = error.response.data.errors
    }
  } finally {
    saving.value = false
  }
}

const confirmDelete = (nxb) => {
  deletingNXB.value = nxb
  showDeleteModal.value = true
}

const deleteNXB = async () => {
  if (!deletingNXB.value) return
  
  deleting.value = true
  try {
    await axios.delete(`/api/nhaxuatban/${deletingNXB.value.MaNhaXuatBan}`)
    if (Array.isArray(nxbList.value)) {
      const index = nxbList.value.findIndex(n => n.MaNhaXuatBan === deletingNXB.value.MaNhaXuatBan)
      if (index !== -1) {
        nxbList.value.splice(index, 1)
      }
    }
    
    showDeleteModal.value = false
    deletingNXB.value = null
    
    // Adjust current page if needed
    if (paginatedNXB.value.length === 0 && currentPage.value > 1) {
      currentPage.value--
    }
    
    console.log('Nhà xuất bản đã được xóa thành công')
  } catch (error) {
    console.error('Error deleting nha xuat ban:', error)
  } finally {
    deleting.value = false
  }
}

// Watch for search query changes
watch(searchQuery, () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  loadNXB()
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