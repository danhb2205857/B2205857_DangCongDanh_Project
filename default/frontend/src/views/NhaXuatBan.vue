<template>
  <div class="publisher-management">
    <div class="row mb-4">
      <div class="col-12 d-flex justify-content-between align-items-center">
        <h2 class="mb-0">🏢 Quản lý Nhà xuất bản</h2>
        <button class="btn btn-primary" @click="showAddModal = true">
          <i class="fas fa-plus"></i> Thêm NXB mới
        </button>
      </div>
    </div>

    <!-- Search -->
    <div class="row mb-4">
      <div class="col-md-6">
        <div class="input-group">
          <input 
            type="text" 
            class="form-control" 
            placeholder="Tìm kiếm nhà xuất bản..."
            v-model="searchTerm"
            @input="filterPublishers"
          >
          <button class="btn btn-outline-secondary" type="button">
            <i class="fas fa-search"></i>
          </button>
        </div>
      </div>
    </div>

    <!-- Publishers Table -->
    <div class="card">
      <div class="card-body">
        <div class="table-responsive">
          <table class="table table-hover">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Tên NXB</th>
                <th>Địa chỉ</th>
                <th>Số điện thoại</th>
                <th>Email</th>
                <th>Số sách</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="publisher in filteredPublishers" :key="publisher.id">
                <td>{{ publisher.id }}</td>
                <td>
                  <strong>{{ publisher.tenNhaXuatBan }}</strong>
                  <br>
                  <small class="text-muted">{{ publisher.moTa }}</small>
                </td>
                <td>{{ publisher.diaChi }}</td>
                <td>{{ publisher.soDienThoai }}</td>
                <td>{{ publisher.email }}</td>
                <td>
                  <span class="badge bg-info">{{ publisher.soSach }}</span>
                </td>
                <td>
                  <span :class="getStatusClass(publisher.trangThai)">
                    {{ getStatusText(publisher.trangThai) }}
                  </span>
                </td>
                <td>
                  <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-primary" @click="editPublisher(publisher)">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" @click="viewBooks(publisher.id)">
                      <i class="fas fa-book"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" @click="deletePublisher(publisher.id)">
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
            <h5 class="modal-title">{{ isEditing ? 'Chỉnh sửa nhà xuất bản' : 'Thêm nhà xuất bản mới' }}</h5>
            <button type="button" class="btn-close" @click="closeModal"></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="savePublisher">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Tên nhà xuất bản *</label>
                  <input type="text" class="form-control" v-model="publisherForm.tenNhaXuatBan" required>
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Email</label>
                  <input type="email" class="form-control" v-model="publisherForm.email">
                </div>
              </div>
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Số điện thoại</label>
                  <input type="tel" class="form-control" v-model="publisherForm.soDienThoai">
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Website</label>
                  <input type="url" class="form-control" v-model="publisherForm.website">
                </div>
              </div>
              <div class="mb-3">
                <label class="form-label">Địa chỉ</label>
                <textarea class="form-control" rows="2" v-model="publisherForm.diaChi"></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Mô tả</label>
                <textarea class="form-control" rows="3" v-model="publisherForm.moTa"></textarea>
              </div>
              <div class="mb-3">
                <label class="form-label">Trạng thái</label>
                <select class="form-select" v-model="publisherForm.trangThai">
                  <option value="hoat_dong">Hoạt động</option>
                  <option value="tam_ngung">Tạm ngưng</option>
                  <option value="ngung_hoat_dong">Ngừng hoạt động</option>
                </select>
              </div>
            </form>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="closeModal">Hủy</button>
            <button type="button" class="btn btn-primary" @click="savePublisher">
              {{ isEditing ? 'Cập nhật' : 'Thêm' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Books Modal -->
    <div class="modal fade" :class="{ show: showBooksModal }" :style="{ display: showBooksModal ? 'block' : 'none' }" tabindex="-1">
      <div class="modal-dialog modal-xl">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">📚 Sách của {{ selectedPublisher?.tenNhaXuatBan }}</h5>
            <button type="button" class="btn-close" @click="closeBooksModal"></button>
          </div>
          <div class="modal-body">
            <div v-if="publisherBooks.length === 0" class="text-center text-muted">
              <p>Chưa có sách nào từ nhà xuất bản này</p>
            </div>
            <div v-else class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Tên sách</th>
                    <th>Tác giả</th>
                    <th>Năm xuất bản</th>
                    <th>Số lượng</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="book in publisherBooks" :key="book.id">
                    <td>{{ book.tenSach }}</td>
                    <td>{{ book.tacGia }}</td>
                    <td>{{ book.namXuatBan }}</td>
                    <td>{{ book.soLuong }}</td>
                    <td>
                      <span :class="getBookStatusClass(book.trangThai)">
                        {{ getBookStatusText(book.trangThai) }}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Backdrop -->
    <div v-if="showAddModal || showEditModal || showBooksModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const publishers = ref([])
const searchTerm = ref('')
const showAddModal = ref(false)
const showEditModal = ref(false)
const showBooksModal = ref(false)
const isEditing = ref(false)
const currentPage = ref(1)
const itemsPerPage = ref(10)
const selectedPublisher = ref(null)
const publisherBooks = ref([])

const publisherForm = ref({
  tenNhaXuatBan: '',
  diaChi: '',
  soDienThoai: '',
  email: '',
  website: '',
  moTa: '',
  trangThai: 'hoat_dong'
})

const filteredPublishers = computed(() => {
  let filtered = publishers.value

  if (searchTerm.value) {
    filtered = filtered.filter(publisher => 
      publisher.tenNhaXuatBan.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
      publisher.email?.toLowerCase().includes(searchTerm.value.toLowerCase())
    )
  }

  return filtered
})

const totalPages = computed(() => Math.ceil(filteredPublishers.value.length / itemsPerPage.value))

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
    case 'hoat_dong':
      return 'badge bg-success'
    case 'tam_ngung':
      return 'badge bg-warning'
    case 'ngung_hoat_dong':
      return 'badge bg-danger'
    default:
      return 'badge bg-secondary'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'hoat_dong':
      return 'Hoạt động'
    case 'tam_ngung':
      return 'Tạm ngưng'
    case 'ngung_hoat_dong':
      return 'Ngừng hoạt động'
    default:
      return 'Không xác định'
  }
}

const getBookStatusClass = (status) => {
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

const getBookStatusText = (status) => {
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

const filterPublishers = () => {
  currentPage.value = 1
}

const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
  }
}

const editPublisher = (publisher) => {
  publisherForm.value = { ...publisher }
  isEditing.value = true
  showEditModal.value = true
}

const viewBooks = async (publisherId) => {
  try {
    selectedPublisher.value = publishers.value.find(p => p.id === publisherId)
    // TODO: Implement API call to fetch books by publisher
    publisherBooks.value = [
      {
        id: 1,
        tenSach: 'Đắc Nhân Tâm',
        tacGia: 'Dale Carnegie',
        namXuatBan: 2024,
        soLuong: 15,
        trangThai: 'co_san'
      },
      {
        id: 2,
        tenSach: 'Nhà Giả Kim',
        tacGia: 'Paulo Coelho',
        namXuatBan: 2024,
        soLuong: 8,
        trangThai: 'co_san'
      }
    ]
    showBooksModal.value = true
  } catch (error) {
    console.error('Error fetching publisher books:', error)
  }
}

const deletePublisher = async (id) => {
  if (confirm('Bạn có chắc chắn muốn xóa nhà xuất bản này?')) {
    try {
      // TODO: Implement API call to delete publisher
      console.log('Deleting publisher:', id)
      publishers.value = publishers.value.filter(publisher => publisher.id !== id)
    } catch (error) {
      console.error('Error deleting publisher:', error)
    }
  }
}

const savePublisher = async () => {
  try {
    if (isEditing.value) {
      // TODO: Implement API call to update publisher
      const index = publishers.value.findIndex(publisher => publisher.id === publisherForm.value.id)
      if (index !== -1) {
        publishers.value[index] = { ...publisherForm.value }
      }
    } else {
      // TODO: Implement API call to create publisher
      const newPublisher = {
        ...publisherForm.value,
        id: Date.now(), // Temporary ID
        soSach: 0
      }
      publishers.value.unshift(newPublisher)
    }
    closeModal()
  } catch (error) {
    console.error('Error saving publisher:', error)
  }
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  isEditing.value = false
  publisherForm.value = {
    tenNhaXuatBan: '',
    diaChi: '',
    soDienThoai: '',
    email: '',
    website: '',
    moTa: '',
    trangThai: 'hoat_dong'
  }
}

const closeBooksModal = () => {
  showBooksModal.value = false
  selectedPublisher.value = null
  publisherBooks.value = []
}

const fetchData = async () => {
  try {
    // TODO: Implement API calls
    // Mock data for now
    publishers.value = [
      {
        id: 1,
        tenNhaXuatBan: 'NXB Tổng hợp',
        diaChi: '123 Đường ABC, Quận 1, TP.HCM',
        soDienThoai: '028-12345678',
        email: 'info@nxbtonghop.com',
        website: 'https://nxbtonghop.com',
        moTa: 'Nhà xuất bản hàng đầu về sách kỹ năng sống',
        trangThai: 'hoat_dong',
        soSach: 45
      },
      {
        id: 2,
        tenNhaXuatBan: 'NXB Văn học',
        diaChi: '456 Đường XYZ, Quận 3, TP.HCM',
        soDienThoai: '028-87654321',
        email: 'contact@nxbvanhoc.com',
        website: 'https://nxbvanhoc.com',
        moTa: 'Chuyên về sách văn học và tiểu thuyết',
        trangThai: 'hoat_dong',
        soSach: 32
      }
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
.publisher-management {
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