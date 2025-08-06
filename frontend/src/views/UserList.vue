<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Quản lý độc giả</h5>
          </div>
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <input type="text" class="form-control" placeholder="Tìm kiếm độc giả..." v-model="searchQuery"
                  @input="handleSearch">
              </div>
              <div class="col-md-6 text-end">
                <button class="btn btn-primary" @click="showAddModal = true">
                  <i class="bi bi-plus-circle me-2"></i>Thêm độc giả
                </button>
              </div>
            </div>

            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Mã độc giả</th>
                    <th>Họ lót</th>
                    <th>Tên</th>
                    <th>Ngày sinh</th>
                    <th>Phái</th>
                    <th>Địa chỉ</th>
                    <th>Điện thoại</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="docgia in docgiaList" :key="docgia.MaDocGia">
                    <td>{{ docgia.MaDocGia }}</td>
                    <td>{{ docgia.HoLot }}</td>
                    <td>{{ docgia.Ten }}</td>
                    <td>{{ formatDate(docgia.NgaySinh) }}</td>
                    <td>{{ docgia.Phai }}</td>
                    <td>{{ docgia.DiaChi }}</td>
                    <td>{{ docgia.DienThoai }}</td>
                    <td>
                      <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" @click="editDocGia(docgia)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" @click="deleteDocGia(docgia.MaDocGia)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div v-if="loading" class="text-center py-4">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const docgiaList = ref([])
const loading = ref(false)
const searchQuery = ref('')
const showAddModal = ref(false)

// Mock data for now
const mockDocGia = [
  {
    MaDocGia: 'DG001',
    HoLot: 'Nguyễn Văn',
    Ten: 'An',
    NgaySinh: '1990-01-15',
    Phai: 'Nam',
    DiaChi: '123 Đường ABC, TP.HCM',
    DienThoai: '0901234567'
  },
  {
    MaDocGia: 'DG002',
    HoLot: 'Trần Thị',
    Ten: 'Bình',
    NgaySinh: '1992-05-20',
    Phai: 'Nữ',
    DiaChi: '456 Đường XYZ, Hà Nội',
    DienThoai: '0987654321'
  }
]

const loadDocGia = async () => {
  loading.value = true
  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500))
    docgiaList.value = mockDocGia
  } catch (error) {
    console.error('Error loading doc gia:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // TODO: Implement search functionality
  console.log('Searching for:', searchQuery.value)
}

const editDocGia = (docgia) => {
  // TODO: Implement edit functionality
  console.log('Editing:', docgia)
}

const deleteDocGia = (maDocGia) => {
  // TODO: Implement delete functionality
  console.log('Deleting:', maDocGia)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN')
}

onMounted(() => {
  loadDocGia()
})
</script>

<style scoped>
@import '@/assets/styles/main.css';
</style>