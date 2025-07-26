<template>
  <div class="borrow-return-management">
    <div class="row mb-4">
      <div class="col-12 d-flex justify-content-between align-items-center">
        <h2 class="mb-0">📖 Quản lý Mượn/Trả sách</h2>
        <div>
          <button class="btn btn-success me-2" @click="showBorrowModal = true">
            <i class="fas fa-plus"></i> Tạo phiếu mượn
          </button>
          <button class="btn btn-primary" @click="showReturnModal = true">
            <i class="fas fa-undo"></i> Tạo phiếu trả
          </button>
        </div>
      </div>
    </div>

    <!-- Filters -->
    <div class="row mb-4">
      <div class="col-md-3">
        <select class="form-select" v-model="filterStatus" @change="filterTransactions">
          <option value="">Tất cả trạng thái</option>
          <option value="dang_muon">Đang mượn</option>
          <option value="da_tra">Đã trả</option>
          <option value="qua_han">Quá hạn</option>
        </select>
      </div>
      <div class="col-md-3">
        <input 
          type="date" 
          class="form-control" 
          v-model="filterDate"
          @change="filterTransactions"
        >
      </div>
      <div class="col-md-4">
        <div class="input-group">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Tìm kiếm theo tên sách hoặc độc giả..."
            v-model="searchTerm"
            @input="filterTransactions"
          >
          <button class="btn btn-outline-secondary" type="button">
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
      <div class="col-md-2">
        <button class="btn btn-outline-info w-100" @click="exportData">
          <i class="fas fa-download"></i> Xuất Excel
        </button>
      </div>
    </div>

    <!-- Statistics Cards -->
    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="card-title">Tổng phiếu mượn</h6>
                <h3 class="mb-0">{{ stats.totalBorrows }}</h3>
              </div>
              <div class="align-self-center">
                <i class="fas fa-book fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card bg-success text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="card-title">Đã trả</h6>
                <h3 class="mb-0">{{ stats.returned }}</h3>
              </div>
              <div class="align-self-center">
                <i class="fas fa-check fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card bg-warning text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="card-title">Đang mượn</h6>
                <h3 class="mb-0">{{ stats.activeBorrows }}</h3>
              </div>
              <div class="align-self-center">
                <i class="fas fa-clock fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="col-md-3 mb-3">
        <div class="card bg-danger text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h6 class="card-title">Quá hạn</h6>
                <h3 class="mb-0">{{ stats.overdue }}</h3>
              </div>
              <div class="align-self-center">
                <i class="fas fa-exclamation-triangle fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Transactions Table -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>Mã phiếu</th>
                <th>Độc giả</th>
                <th>Sách</th>
                <th>Ngày mượn</th>
                <th>Hạn trả</th>
                <th>Ngày trả</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="transaction in filteredTransactions" :key="transaction.id">
                <td>
                  <strong>{{ transaction.maPhieu }}</strong>
                  <br>
                  <small class="text-muted">{{ transaction.loaiPhieu }}</small>
                </td>
                <td>
                  <strong>{{ transaction.tenDocGia }}</strong>
                  <br>
                  <small class="text-muted">{{ transaction.emailDocGia }}</small>
                </td>
                <td>
                  <strong>{{ transaction.tenSach }}</strong>
                  <br>
                  <small class="text-muted">{{ transaction.tacGia }}</small>
                </td>
                <td>{{ formatDate(transaction.ngayMuon) }}</td>
                <td>
                  <span :class="getDueDateClass(transaction.hanTra)">
                    {{ formatDate(transaction.hanTra) }}
                  </span>
                </td>
                <td>{{ transaction.ngayTra ? formatDate(transaction.ngayTra) : '-' }}</td>
                <td>
                  <span :class="getStatusClass(transaction.trangThai)">
                    {{ getStatusText(transaction.trangThai) }}
                  </span>
                </td>
                <td>
                  <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-info" @click="viewDetails(transaction)">
                      <i class="fas fa-eye"></i>
                    </button>
                    <button v-if="transaction.trangThai === 'dang_muon'" class="btn btn-sm btn-outline-success" @click="returnBook(transaction)">
                      <i class="fas fa-undo"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-warning" @click="extendDueDate(transaction)">
                      <i class="fas fa-calendar-plus"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        <nav v-if="totalPages > 1" class="mt-4">
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: currentPage === 1 }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage - 1)">Trước</a>
            </li>
            <li v-for="page in visiblePages" :key="page" class="page-item" :class="{ active: page === currentPage }">
              <a class="page-link" href="#" @click.prevent="changePage(page)">{{ page }}</a>
            </li>
            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
              <a class="page-link" href="#" @click.prevent="changePage(currentPage + 1)">Sau</a>
            </li>
          </ul>
        </nav>
      </div>
    </div>

    <!-- Borrow Modal -->
    <div class="modal fade" :class="{ show: showBorrowModal }" :style="{ display: showBorrowModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">📚 Tạo phiếu mượn sách</h5>
            <button type="button" class="btn-close" @click="closeBorrowModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createBorrow">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Độc giả *</label>
                  <select class="form-select" v-model="borrowForm.docGiaId" required>
                    <option value="">Chọn độc giả</option>
                    <option v-for="reader in readers" :key="reader.id" :value="reader.id">
                      {{ reader.hoTen }} - {{ reader.email }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Sách *</label>
                  <select class="form-select" v-model="borrowForm.sachId" required>
                    <option value="">Chọn sách</option>
                    <option v-for="book in availableBooks" :key="book.id" :value="book.id">
                      {{ book.tenSach }} ({{ book.soLuong }} cuốn)
                    </option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Ngày mượn</label>
                  <input type="date" class="form-control" v-model="borrowForm.ngayMuon" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Hạn trả</label>
                  <input type="date" class="form-control" v-model="borrowForm.hanTra" required>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Ghi chú</label>
                <textarea class="form-control" rows="3" v-model="borrowForm.ghiChu"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeBorrowModal">Hủy</button>
            <button type="button" class="btn btn-success" @click="createBorrow">Tạo phiếu mượn</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Return Modal -->
    <div class="modal fade" :class="{ show: showReturnModal }" :style="{ display: showReturnModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">📖 Tạo phiếu trả sách</h5>
            <button type="button" class="btn-close" @click="closeReturnModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="createReturn">
              <div class="mb-3">
                <label class="form-label">Phiếu mượn *</label>
                <select class="form-select" v-model="returnForm.phieuMuonId" required>
                  <option value="">Chọn phiếu mượn</option>
                  <option v-for="borrow in activeBorrows" :key="borrow.id" :value="borrow.id">
                    {{ borrow.maPhieu }} - {{ borrow.tenDocGia }} - {{ borrow.tenSach }}
                  </option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Ngày trả</label>
                <input type="date" class="form-control" v-model="returnForm.ngayTra" required>
              </div>
              <div class="mb-3">
                <label class="form-label">Tình trạng sách</label>
                <select class="form-select" v-model="returnForm.tinhTrangSach">
                  <option value="tot">Tốt</option>
                  <option value="hong_nhe">Hỏng nhẹ</option>
                  <option value="hong_nang">Hỏng nặng</option>
                  <option value="mat">Mất</option>
                </select>
              </div>
              <div class="mb-3">
                <label class="form-label">Ghi chú</label>
                <textarea class="form-control" rows="3" v-model="returnForm.ghiChu"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeReturnModal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="createReturn">Tạo phiếu trả</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div v-if="showBorrowModal || showReturnModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const transactions = ref([])
const readers = ref([])
const availableBooks = ref([])
const searchTerm = ref('')
const filterStatus = ref('')
const filterDate = ref('')
const showBorrowModal = ref(false)
const showReturnModal = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)

const stats = ref({
  totalBorrows: 0,
  returned: 0,
  activeBorrows: 0,
  overdue: 0
})

const borrowForm = ref({
  docGiaId: '',
  sachId: '',
  ngayMuon: new Date().toISOString().split('T')[0],
  hanTra: '',
  ghiChu: ''
})

const returnForm = ref({
  phieuMuonId: '',
  ngayTra: new Date().toISOString().split('T')[0],
  tinhTrangSach: 'tot',
  ghiChu: ''
})

const filteredTransactions = computed(() => {
  let filtered = transactions.value

  if (searchTerm.value) {
    filtered = filtered.filter(transaction => 
      transaction.tenSach.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      transaction.tenDocGia.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  if (filterStatus.value) {
    filtered = filtered.filter(transaction => transaction.trangThai === filterStatus.value)
  }

  if (filterDate.value) {
    filtered = filtered.filter(transaction => 
      transaction.ngayMuon === filterDate.value || transaction.ngayTra === filterDate.value
    )
  }

  return filtered
})

const activeBorrows = computed(() => 
  transactions.value.filter(t => t.trangThai === 'dang_muon')
)

const totalPages = computed(() => Math.ceil(filteredTransactions.value.length / itemsPerPage.value))

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const getStatusClass = (status) => {
  switch (status) {
    case 'dang_muon':
      return 'badge bg-warning'
    case 'da_tra':
      return 'badge bg-success'
    case 'qua_han':
      return 'badge bg-danger'
    default:
      return 'badge bg-secondary'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'dang_muon':
      return 'Đang mượn'
    case 'da_tra':
      return 'Đã trả'
    case 'qua_han':
      return 'Quá hạn'
    default:
      return 'Không xác định'
  }
}

const getDueDateClass = (dueDate) => {
  const today = new Date()
  const due = new Date(dueDate)
  if (due < today) return 'text-danger fw-bold'
  if (due.getTime() - today.getTime() < 3 * 24 * 60 * 60 * 1000) return 'text-warning fw-bold'
  return 'text-success'
}

const formatDate = (date) => {
  if (!date) return '-'
  return new Date(date).toLocaleDateString('vi-VN')
}

const filterTransactions = () => {
  currentPage.value = 1
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const viewDetails = (transaction) => {
  // TODO: Implement view details modal
  console.log('View details:', transaction)
}

const returnBook = (transaction) => {
  returnForm.value.phieuMuonId = transaction.id
  showReturnModal.value = true
}

const extendDueDate = (transaction) => {
  // TODO: Implement extend due date functionality
  console.log('Extend due date:', transaction)
}

const createBorrow = async () => {
  try {
    // TODO: Implement API call to create borrow
    const newBorrow = {
      id: Date.now(),
      maPhieu: `PM${Date.now()}`,
      loaiPhieu: 'Phiếu mượn',
      docGiaId: borrowForm.value.docGiaId,
      sachId: borrowForm.value.sachId,
      ngayMuon: borrowForm.value.ngayMuon,
      hanTra: borrowForm.value.hanTra,
      trangThai: 'dang_muon',
      ghiChu: borrowForm.value.ghiChu,
      tenDocGia: readers.value.find(r => r.id == borrowForm.value.docGiaId)?.hoTen,
      tenSach: availableBooks.value.find(b => b.id == borrowForm.value.sachId)?.tenSach
    }
    transactions.value.unshift(newBorrow)
    closeBorrowModal()
    updateStats()
  } catch (error) {
    console.error('Error creating borrow:', error)
  }
}

const createReturn = async () => {
  try {
    // TODO: Implement API call to create return
    const borrow = transactions.value.find(t => t.id == returnForm.value.phieuMuonId)
    if (borrow) {
      borrow.ngayTra = returnForm.value.ngayTra
      borrow.trangThai = 'da_tra'
    }
    closeReturnModal()
    updateStats()
  } catch (error) {
    console.error('Error creating return:', error)
  }
}

const closeBorrowModal = () => {
  showBorrowModal.value = false
  borrowForm.value = {
    docGiaId: '',
    sachId: '',
    ngayMuon: new Date().toISOString().split('T')[0],
    hanTra: '',
    ghiChu: ''
  }
}

const closeReturnModal = () => {
  showReturnModal.value = false
  returnForm.value = {
    phieuMuonId: '',
    ngayTra: new Date().toISOString().split('T')[0],
    tinhTrangSach: 'tot',
    ghiChu: ''
  }
}

const exportData = () => {
  // TODO: Implement export to Excel functionality
  console.log('Exporting data...')
}

const updateStats = () => {
  stats.value = {
    totalBorrows: transactions.value.length,
    returned: transactions.value.filter(t => t.trangThai === 'da_tra').length,
    activeBorrows: transactions.value.filter(t => t.trangThai === 'dang_muon').length,
    overdue: transactions.value.filter(t => {
      if (t.trangThai !== 'dang_muon') return false
      const due = new Date(t.hanTra)
      const today = new Date()
      return due < today
    }).length
  }
}

const fetchData = async () => {
  try {
    // TODO: Implement API calls
    // Mock data for now
    transactions.value = [
      {
        id: 1,
        maPhieu: 'PM001',
        loaiPhieu: 'Phiếu mượn',
        tenDocGia: 'Nguyễn Văn A',
        emailDocGia: 'nguyenvana@email.com',
        tenSach: 'Đắc Nhân Tâm',
        tacGia: 'Dale Carnegie',
        ngayMuon: '2024-01-15',
        hanTra: '2024-02-15',
        ngayTra: null,
        trangThai: 'dang_muon'
      },
      {
        id: 2,
        maPhieu: 'PM002',
        loaiPhieu: 'Phiếu mượn',
        tenDocGia: 'Trần Thị B',
        emailDocGia: 'tranthib@email.com',
        tenSach: 'Nhà Giả Kim',
        tacGia: 'Paulo Coelho',
        ngayMuon: '2024-01-10',
        hanTra: '2024-02-10',
        ngayTra: '2024-02-08',
        trangThai: 'da_tra'
      }
    ]

    readers.value = [
      { id: 1, hoTen: 'Nguyễn Văn A', email: 'nguyenvana@email.com' },
      { id: 2, hoTen: 'Trần Thị B', email: 'tranthib@email.com' }
    ]

    availableBooks.value = [
      { id: 1, tenSach: 'Đắc Nhân Tâm', soLuong: 15 },
      { id: 2, tenSach: 'Nhà Giả Kim', soLuong: 8 }
    ]

    updateStats()
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.borrow-return-management {
  padding: 20px 0;
}

.table th {
  border-top: none;
  font-weight: 600;
}

.btn-group .btn {
  margin-right: 2px;
}

.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}
</style> 