<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card shadow">
          <div class="card-header py-3">
            <h5 class="card-title mb-0 text-primary font-weight-bold">
              <i class="bi bi-journal-bookmark me-2"></i>Quản lý mượn trả sách
            </h5>
            <small class="text-muted">
              Nhân viên thao tác: <strong>{{ currentUser?.HoTenNV || currentUser?.hoTenNV || 'Không xác định'
                }}</strong>
              ({{ currentStaffId }})
            </small>
          </div>
          <div class="card-body">
            <!-- Search and Add Section -->
            <div class="row mb-4">
              <div class="col-md-6">
                <div class="input-group">
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                  <input type="text" class="form-control" placeholder="Tìm kiếm theo mã, độc giả, sách..."
                    v-model="searchQuery" @input="handleSearch">
                  <button class="btn btn-outline-secondary" @click="clearSearch" v-if="searchQuery">
                    <i class="bi bi-x"></i>
                  </button>
                </div>
              </div>
              <div class="col-md-3">
                <select class="form-select" v-model="statusFilter" @change="handleStatusFilter">
                  <option value="">Tất cả trạng thái</option>
                  <option value="Đang mượn">Đang mượn</option>
                  <option value="Đã trả">Đã trả</option>
                  <option value="Quá hạn">Quá hạn</option>
                </select>
              </div>
              <div class="col-md-3 text-end">
                <button class="btn btn-primary" @click="showBorrowModal">
                  <i class="bi bi-plus-circle me-2"></i>Mượn sách
                </button>
              </div>
            </div>

            <!-- Table Section -->
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="table-light">
                  <tr>
                    <th style="width: 120px;">Mã theo dõi</th>
                    <th>Độc giả</th>
                    <th>Sách</th>
                    <th style="width: 120px;">Ngày mượn</th>
                    <th style="width: 120px;">Ngày hẹn trả</th>
                    <th style="width: 120px;">Ngày trả</th>
                    <th style="width: 120px;">Trạng thái</th>
                    <th style="width: 150px;" class="text-center">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="record in paginatedRecords" :key="record.MaTheoDoiMuonSach">
                    <td>
                      <span class="badge bg-primary">{{ record.MaTheoDoiMuonSach }}</span>
                    </td>
                    <td class="fw-bold">{{ getReaderName(record) }}</td>
                    <td>{{ getBookTitle(record) }}</td>
                    <td>{{ formatDate(record.NgayMuon) }}</td>
                    <td :class="getDueDateClass(record)">{{ formatDate(record.NgayHenTra) }}</td>
                    <td>{{ record.NgayTra ? formatDate(record.NgayTra) : '-' }}</td>
                    <td>
                      <span :class="'badge ' + getStatusClass(record.TrangThai)">
                        {{ record.TrangThai }}
                      </span>
                    </td>
                    <td class="text-center">
                      <div class="btn-group" role="group">
                        <button v-if="record.TrangThai === 'Đang mượn'" class="btn btn-sm btn-outline-success"
                          @click="showReturnModal(record)" title="Trả sách">
                          <i class="bi bi-check-circle"></i>
                        </button>
                        <button v-if="record.TrangThai === 'Đang mượn'" class="btn btn-sm btn-outline-warning"
                          @click="showExtendModal(record)" title="Gia hạn">
                          <i class="bi bi-calendar-plus"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-info" @click="viewDetails(record)" title="Xem chi tiết">
                          <i class="bi bi-eye"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="filteredRecords.length === 0 && !loading">
                    <td colspan="8" class="text-center text-muted py-4">
                      <i class="bi bi-inbox display-4 d-block mb-2"></i>
                      {{ searchQuery || statusFilter ? 'Không tìm thấy bản ghi nào' : 'Chưa có bản ghi mượn trả nào' }}
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
              <p class="mt-2 text-muted">Đang tải danh sách mượn trả sách...</p>
            </div>

            <!-- Pagination -->
            <div class="row mt-4" v-if="totalItems > 0">
              <div class="col-md-6">
                <p class="text-muted">
                  Hiển thị {{ startIndex + 1 }} - {{ endIndex }} trong tổng số {{
                    totalItems }} bản ghi
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



    <!-- Borrow Modal -->
    <div class="modal fade" :class="{ show: showBorrowModalState }"
      :style="{ display: showBorrowModalState ? 'block' : 'none' }" tabindex="-1">
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
                        {{ sach.TenSach }} ({{ sach.MaSach }}) - Còn: {{ sach.SoQuyenConLai || sach.SoQuyen }}
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
                    <label for="nhanVienMuon" class="form-label">Nhân viên xử lý <span
                        class="text-danger">*</span></label>
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
    <div class="modal fade" :class="{ show: showReturnModalState }"
      :style="{ display: showReturnModalState ? 'block' : 'none' }" tabindex="-1">
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
    <div class="modal fade" :class="{ show: showExtendModalState }"
      :style="{ display: showExtendModalState ? 'block' : 'none' }" tabindex="-1">
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
                <label for="ngayHenTraMoi" class="form-label">Ngày hẹn trả mới <span
                    class="text-danger">*</span></label>
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

    <!-- View Details Modal -->
    <div class="modal fade" :class="{ show: showDetailsModalState }"
      :style="{ display: showDetailsModalState ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-info">
              <i class="bi bi-info-circle me-2"></i>Chi tiết mượn trả sách
            </h5>
            <button type="button" class="btn-close" @click="closeDetailsModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="viewingRecord">
              <div class="row">
                <div class="col-md-6">
                  <div class="card border-primary mb-3">
                    <div class="card-header bg-primary text-white">
                      <i class="bi bi-bookmark me-2"></i>Thông tin mượn sách
                    </div>
                    <div class="card-body">
                      <div class="mb-2">
                        <strong>Mã theo dõi:</strong>
                        <span class="badge bg-primary ms-2">{{ viewingRecord.MaTheoDoiMuonSach }}</span>
                      </div>
                      <div class="mb-2">
                        <strong>Ngày mượn:</strong>
                        <span class="ms-2">{{ formatDate(viewingRecord.NgayMuon) }}</span>
                      </div>
                      <div class="mb-2">
                        <strong>Ngày hẹn trả:</strong>
                        <span class="ms-2" :class="getDueDateClass(viewingRecord)">
                          {{ formatDate(viewingRecord.NgayHenTra) }}
                        </span>
                      </div>
                      <div class="mb-2">
                        <strong>Ngày trả:</strong>
                        <span class="ms-2">{{ viewingRecord.NgayTra ? formatDate(viewingRecord.NgayTra) : 'Chưa trả'
                        }}</span>
                      </div>
                      <div class="mb-2">
                        <strong>Trạng thái:</strong>
                        <span :class="'badge ms-2 ' + getStatusClass(viewingRecord.TrangThai)">
                          {{ viewingRecord.TrangThai }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="card border-success mb-3">
                    <div class="card-header bg-success text-white">
                      <i class="bi bi-person me-2"></i>Thông tin độc giả
                    </div>
                    <div class="card-body">
                      <div class="mb-2">
                        <strong>Mã độc giả:</strong>
                        <span class="badge bg-success ms-2">{{ getDocGiaCode(viewingRecord) }}</span>
                      </div>
                      <div class="mb-2">
                        <strong>Họ tên:</strong>
                        <span class="ms-2">{{ getReaderName(viewingRecord) }}</span>
                      </div>
                      <div class="mb-2">
                        <strong>Điện thoại:</strong>
                        <span class="ms-2">{{ getDocGiaPhone(viewingRecord) || 'Không có' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="card border-info mb-3">
                    <div class="card-header bg-info text-white">
                      <i class="bi bi-book me-2"></i>Thông tin sách
                    </div>
                    <div class="card-body">
                      <div class="mb-2">
                        <strong>Mã sách:</strong>
                        <span class="badge bg-info ms-2">{{ getSachCode(viewingRecord) }}</span>
                      </div>
                      <div class="mb-2">
                        <strong>Tên sách:</strong>
                        <span class="ms-2">{{ getBookTitle(viewingRecord) }}</span>
                      </div>
                      <div class="mb-2">
                        <strong>Tác giả:</strong>
                        <span class="ms-2">{{ getSachAuthor(viewingRecord) || 'Không có' }}</span>
                      </div>
                      <div class="mb-2">
                        <strong>Số quyển:</strong>
                        <span class="ms-2">{{ getSachQuantity(viewingRecord) || 'Không có' }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="col-md-6">
                  <div class="card border-warning mb-3">
                    <div class="card-header bg-warning text-dark">
                      <i class="bi bi-person-badge me-2"></i>Thông tin nhân viên
                    </div>
                    <div class="card-body">
                      <div class="mb-2">
                        <strong>NV xử lý mượn:</strong>
                        <span class="ms-2">{{ viewingRecord.NhanVienMuon || 'Không có' }}</span>
                      </div>
                      <div class="mb-2">
                        <strong>NV xử lý trả:</strong>
                        <span class="ms-2">{{ viewingRecord.NhanVienTra || 'Chưa trả' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-12">
                  <div class="card border-secondary">
                    <div class="card-header bg-secondary text-white">
                      <i class="bi bi-chat-text me-2"></i>Ghi chú
                    </div>
                    <div class="card-body">
                      <p class="mb-0" :class="viewingRecord.GhiChu ? '' : 'text-muted fst-italic'">
                        {{ viewingRecord.GhiChu || 'Không có ghi chú' }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeDetailsModal">
              <i class="bi bi-x-circle me-2"></i>Đóng
            </button>
            <div v-if="viewingRecord && viewingRecord.TrangThai === 'Đang mượn'">
              <button type="button" class="btn btn-success me-2" @click="showReturnModalFromDetails">
                <i class="bi bi-check-circle me-2"></i>Trả sách
              </button>
              <button type="button" class="btn btn-warning" @click="showExtendModalFromDetails">
                <i class="bi bi-calendar-plus me-2"></i>Gia hạn
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div class="modal-backdrop fade show"
      v-if="showBorrowModalState || showReturnModalState || showExtendModalState || showDetailsModalState">
    </div>
  </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../utils/axios.js'

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
const totalItems = ref(0)
const totalPages = ref(0)

// Modal states
const showBorrowModalState = ref(false)
const showReturnModalState = ref(false)
const showExtendModalState = ref(false)
const showDetailsModalState = ref(false)
const returningRecord = ref(null)
const extendingRecord = ref(null)
const viewingRecord = ref(null)

// Get current user info
const getCurrentUser = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    return user
  } catch (error) {
    console.error('Error parsing user data:', error)
    return {}
  }
}

const currentUser = getCurrentUser()
const currentStaffId = currentUser?.MSNV || currentUser?.msnv || 'NV001'

// Form data
const borrowForm = ref({
  MaDocGia: '',
  MaSach: '',
  NgayHenTra: '',
  GhiChu: '',
  NhanVienMuon: currentStaffId // Current staff ID
})

const returnForm = ref({
  NhanVienTra: currentStaffId, // Current staff ID
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

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => {
  return Math.min(startIndex.value + itemsPerPage.value, totalItems.value)
})

const paginatedRecords = computed(() => {
  if (!Array.isArray(filteredRecords.value)) return []
  return filteredRecords.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
  const pages = []
  const totalPagesComputed = Math.ceil(filteredRecords.value.length / itemsPerPage.value)
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPagesComputed, currentPage.value + 2)

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const availableBooks = computed(() => {
  return sachList.value.filter(sach => (sach.SoQuyenConLai || sach.SoQuyen) > 0)
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
    console.log('API Response:', response.data)

    if (response.data.success) {
      recordsList.value = response.data.data || []
      totalItems.value = response.data.pagination?.totalItems || recordsList.value.length
      console.log('Loaded records:', recordsList.value)
    } else {
      recordsList.value = []
      totalItems.value = 0
    }
  } catch (error) {
    console.error('Error loading records from API:', error)
    recordsList.value = []
    totalItems.value = 0
  } finally {
    loading.value = false
  }
}

const loadDocGia = async () => {
  try {
    const response = await api.get('/docgia')
    if (response.data.success) {
      const apiData = response.data.data?.docgia || response.data.data || []
      docGiaList.value = Array.isArray(apiData) ? apiData : []
    } else {
      docGiaList.value = []
    }
  } catch (error) {
    console.error('Error loading doc gia:', error)
    docGiaList.value = []
  }
}

const loadSach = async () => {
  try {
    const response = await api.get('/sach/available')
    if (response.data.success) {
      const apiData = response.data.data || []
      sachList.value = Array.isArray(apiData) ? apiData : []
    } else {
      sachList.value = []
    }
  } catch (error) {
    console.error('Error loading sach:', error)
    sachList.value = []
  }
}

const handleSearch = () => {
  currentPage.value = 1
}

const handleStatusFilter = () => {
  currentPage.value = 1
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
  const totalPagesComputed = Math.ceil(filteredRecords.value.length / itemsPerPage.value)
  if (page >= 1 && page <= totalPagesComputed) {
    currentPage.value = page
  }
}

// Helper methods
const getReaderName = (record) => {
  if (record.MaDocGia && typeof record.MaDocGia === 'object') {
    return `${record.MaDocGia.HoLot} ${record.MaDocGia.Ten}`.trim()
  }
  // For string MaDocGia, find in docGiaList
  const docgia = docGiaList.value.find(d => d.MaDocGia === record.MaDocGia)
  return docgia ? `${docgia.HoLot} ${docgia.Ten}`.trim() : record.MaDocGia || 'N/A'
}

const getBookTitle = (record) => {
  if (record.MaSach && typeof record.MaSach === 'object') {
    return record.MaSach.TenSach
  }
  // For string MaSach, find in sachList
  const sach = sachList.value.find(s => s.MaSach === record.MaSach)
  return sach ? sach.TenSach : record.MaSach || 'N/A'
}

// Additional helper methods for details modal
const getDocGiaCode = (record) => {
  if (record.MaDocGia && typeof record.MaDocGia === 'object') {
    return record.MaDocGia.MaDocGia || 'N/A'
  }
  return record.MaDocGia || 'N/A'
}

const getDocGiaPhone = (record) => {
  if (record.MaDocGia && typeof record.MaDocGia === 'object') {
    return record.MaDocGia.DienThoai || ''
  }
  // For string MaDocGia, find in docGiaList
  const docgia = docGiaList.value.find(d => d.MaDocGia === record.MaDocGia)
  return docgia ? docgia.DienThoai : ''
}

const getSachCode = (record) => {
  if (record.MaSach && typeof record.MaSach === 'object') {
    return record.MaSach.MaSach || 'N/A'
  }
  return record.MaSach || 'N/A'
}

const getSachAuthor = (record) => {
  if (record.MaSach && typeof record.MaSach === 'object') {
    return record.MaSach.NguonGoc || ''
  }
  // For string MaSach, find in sachList
  const sach = sachList.value.find(s => s.MaSach === record.MaSach)
  return sach ? sach.NguonGoc : ''
}

const getSachQuantity = (record) => {
  if (record.MaSach && typeof record.MaSach === 'object') {
    return record.MaSach.SoQuyen || 0
  }
  // For string MaSach, find in sachList
  const sach = sachList.value.find(s => s.MaSach === record.MaSach)
  return sach ? sach.SoQuyen : 0
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
    NhanVienMuon: currentStaffId
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
    NhanVienTra: currentStaffId,
    GhiChu: ''
  }
  returnErrors.value = {}
  showReturnModalState.value = true
}

const closeReturnModal = () => {
  showReturnModalState.value = false
  returningRecord.value = null
  returnForm.value = { NhanVienTra: currentStaffId, GhiChu: '' }
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
  viewingRecord.value = record
  showDetailsModalState.value = true
}

const closeDetailsModal = () => {
  showDetailsModalState.value = false
  viewingRecord.value = null
}

const showReturnModalFromDetails = () => {
  const record = viewingRecord.value
  closeDetailsModal()
  showReturnModal(record)
}

const showExtendModalFromDetails = () => {
  const record = viewingRecord.value
  closeDetailsModal()
  showExtendModal(record)
}

// Watch for search changes
watch([searchQuery, statusFilter], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(async () => {
  // Load reference data first
  await Promise.all([loadDocGia(), loadSach()])
  // Then load records
  await loadRecords()
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