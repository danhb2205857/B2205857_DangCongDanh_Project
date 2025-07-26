<template>
  <div class="sach-management">
    <div class="row mb-4">
      <div class="col-12 d-flex justify-content-between align-items-center">
        <h2 class="mb-0">📚 Quản lý Sách</h2>
        <button class="btn btn-primary" @click="showAddModal = true">
          <i class="fas fa-plus"></i> Thêm sách mới
        </button>
      </div>
    </div>

    <!-- Search and Filter -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Tìm kiếm sách..."
            v-model="searchTerm"
            @input="filterBooks"
          >
          <button class="btn btn-outline-secondary" type="button">
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
      <div class="col-md-3">
        <select class="form-select" v-model="filterCategory" @change="filterBooks">
          <option value="">Tất cả thể loại</option>
          <option v-for="category in categories" :key="category.id" :value="category.id">
            {{ category.tenTheLoai }}
          </option>
        </select>
      </div>
      <div class="col-md-3">
        <select class="form-select" v-model="filterPublisher" @change="filterBooks">
          <option value="">Tất cả NXB</option>
          <option v-for="publisher in publishers" :key="publisher.id" :value="publisher.id">
            {{ publisher.tenNhaXuatBan }}
          </option>
        </select>
      </div>
    </div>

    <!-- Books Table -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Tên sách</th>
                <th>Tác giả</th>
                <th>Thể loại</th>
                <th>Nhà xuất bản</th>
                <th>Năm xuất bản</th>
                <th>Số lượng</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="book in filteredBooks" :key="book.id">
                <td>{{ book.id }}</td>
                <td>
                  <strong>{{ book.tenSach }}</strong>
                  <br>
                  <small class="text-muted">{{ book.moTa }}</small>
                </td>
                <td>{{ book.tacGia }}</td>
                <td>
                  <span class="badge bg-info">{{ getCategoryName(book.theLoaiId) }}</span>
                </td>
                <td>{{ getPublisherName(book.nhaXuatBanId) }}</td>
                <td>{{ book.namXuatBan }}</td>
                <td>
                  <span :class="getQuantityClass(book.soLuong)">
                    {{ book.soLuong }}
                  </span>
                </td>
                <td>
                  <span :class="getStatusClass(book.trangThai)">
                    {{ getStatusText(book.trangThai) }}
                  </span>
                </td>
                <td>
                  <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-primary" @click="editBook(book)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="deleteBook(book.id)">
                      <i class="fas fa-trash"></i>
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

    <!-- Add/Edit Modal -->
    <div class="modal fade" :class="{ show: showAddModal || showEditModal }" :style="{ display: (showAddModal || showEditModal) ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">{{ isEditing ? 'Chỉnh sửa sách' : 'Thêm sách mới' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="saveBook">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Tên sách *</label>
                  <input type="text" class="form-control" v-model="bookForm.tenSach" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Tác giả *</label>
                  <input type="text" class="form-control" v-model="bookForm.tacGia" required>
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Thể loại *</label>
                  <select class="form-select" v-model="bookForm.theLoaiId" required>
                    <option value="">Chọn thể loại</option>
                    <option v-for="category in categories" :key="category.id" :value="category.id">
                      {{ category.tenTheLoai }}
                    </option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Nhà xuất bản *</label>
                  <select class="form-select" v-model="bookForm.nhaXuatBanId" required>
                    <option value="">Chọn nhà xuất bản</option>
                    <option v-for="publisher in publishers" :key="publisher.id" :value="publisher.id">
                      {{ publisher.tenNhaXuatBan }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">Năm xuất bản</label>
                  <input type="number" class="form-control" v-model="bookForm.namXuatBan" min="1900" max="2025">
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Số lượng *</label>
                  <input type="number" class="form-control" v-model="bookForm.soLuong" min="0" required>
                </div>
                <div class="col-md-4 mb-3">
                  <label class="form-label">Trạng thái</label>
                  <select class="form-select" v-model="bookForm.trangThai">
                    <option value="co_san">Có sẵn</option>
                    <option value="het_sach">Hết sách</option>
                    <option value="bao_tri">Bảo trì</option>
                  </select>
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Mô tả</label>
                <textarea class="form-control" rows="3" v-model="bookForm.moTa"></textarea>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="saveBook">
              {{ isEditing ? 'Cập nhật' : 'Thêm' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div v-if="showAddModal || showEditModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const books = ref([])
const categories = ref([])
const publishers = ref([])
const searchTerm = ref('')
const filterCategory = ref('')
const filterPublisher = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const isEditing = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)

const bookForm = ref({
  tenSach: '',
  tacGia: '',
  theLoaiId: '',
  nhaXuatBanId: '',
  namXuatBan: new Date().getFullYear(),
  soLuong: 1,
  trangThai: 'co_san',
  moTa: ''
})

const filteredBooks = computed(() => {
  let filtered = books.value

  if (searchTerm.value) {
    filtered = filtered.filter(book => 
      book.tenSach.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      book.tacGia.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  if (filterCategory.value) {
    filtered = filtered.filter(book => book.theLoaiId == filterCategory.value)
  }

  if (filterPublisher.value) {
    filtered = filtered.filter(book => book.nhaXuatBanId == filterPublisher.value)
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredBooks.value.length / itemsPerPage.value))

const visiblePages = computed(() => {
  const pages = []
  const start = Math.max(1, currentPage.value - 2)
  const end = Math.min(totalPages.value, currentPage.value + 2)
  
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const getCategoryName = (categoryId) => {
  const category = categories.value.find(c => c.id == categoryId)
  return category ? category.tenTheLoai : 'N/A'
}

const getPublisherName = (publisherId) => {
  const publisher = publishers.value.find(p => p.id == publisherId)
  return publisher ? publisher.tenNhaXuatBan : 'N/A'
}

const getQuantityClass = (quantity) => {
  if (quantity === 0) return 'text-danger fw-bold'
  if (quantity < 5) return 'text-warning fw-bold'
  return 'text-success fw-bold'
}

const getStatusClass = (status) => {
  switch (status) {
    case 'co_san':
      return 'badge bg-success'
    case 'het_sach':
      return 'badge bg-danger'
    case 'bao_tri':
      return 'badge bg-warning'
    default:
      return 'badge bg-secondary'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'co_san':
      return 'Có sẵn'
    case 'het_sach':
      return 'Hết sách'
    case 'bao_tri':
      return 'Bảo trì'
    default:
      return 'Không xác định'
  }
}

const filterBooks = () => {
  currentPage.value = 1
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const editBook = (book) => {
  bookForm.value = { ...book }
  isEditing.value = true
  showEditModal.value = true
}

const deleteBook = async (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa sách này?')) {
    try {
      // TODO: Implement API call to delete book
      console.log('Deleting book:', id)
      books.value = books.value.filter(book => book.id !== id)
    } catch (error) {
      console.error('Error deleting book:', error)
    }
  }
}

const saveBook = async () => {
  try {
    if (isEditing.value) {
      // TODO: Implement API call to update book
      const index = books.value.findIndex(book => book.id === bookForm.value.id)
      if (index !== -1) {
        books.value[index] = { ...bookForm.value }
      }
    } else {
      // TODO: Implement API call to create book
      const newBook = {
        ...bookForm.value,
        id: Date.now() // Temporary ID
      }
      books.value.unshift(newBook)
    }
    closeModal()
  } catch (error) {
    console.error('Error saving book:', error)
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  isEditing.value = false
  bookForm.value = {
    tenSach: '',
    tacGia: '',
    theLoaiId: '',
    nhaXuatBanId: '',
    namXuatBan: new Date().getFullYear(),
    soLuong: 1,
    trangThai: 'co_san',
    moTa: ''
  }
}

const fetchData = async () => {
  try {
    // TODO: Implement API calls
    // Mock data for now
    books.value = [
      {
        id: 1,
        tenSach: 'Đắc Nhân Tâm',
        tacGia: 'Dale Carnegie',
        theLoaiId: 1,
        nhaXuatBanId: 1,
        namXuatBan: 2024,
        soLuong: 15,
        trangThai: 'co_san',
        moTa: 'Cuốn sách về nghệ thuật đắc nhân tâm'
      },
      {
        id: 2,
        tenSach: 'Nhà Giả Kim',
        tacGia: 'Paulo Coelho',
        theLoaiId: 2,
        nhaXuatBanId: 2,
        namXuatBan: 2024,
        soLuong: 8,
        trangThai: 'co_san',
        moTa: 'Tiểu thuyết về hành trình tìm kiếm'
      }
    ]

    categories.value = [
      { id: 1, tenTheLoai: 'Kỹ năng sống' },
      { id: 2, tenTheLoai: 'Tiểu thuyết' },
      { id: 3, tenTheLoai: 'Khoa học' }
    ]

    publishers.value = [
      { id: 1, tenNhaXuatBan: 'NXB Tổng hợp' },
      { id: 2, tenNhaXuatBan: 'NXB Văn học' },
      { id: 3, tenNhaXuatBan: 'NXB Khoa học' }
    ]
  } catch (error) {
    console.error('Error fetching data:', error)
  }
}

onMounted(() => {
  fetchData()
})
</script>

<style scoped>
.sach-management {
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