<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Quản lý sách</h5>
          </div>
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Tìm kiếm sách..."
                  v-model="searchQuery"
                  @input="handleSearch"
                >
              </div>
              <div class="col-md-6 text-end">
                <button class="btn btn-primary" @click="showAddModal = true">
                  <i class="bi bi-plus-circle me-2"></i>Thêm sách
                </button>
              </div>
            </div>
            
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Mã sách</th>
                    <th>Tên sách</th>
                    <th>Đơn giá</th>
                    <th>Số quyển</th>
                    <th>Năm XB</th>
                    <th>Nhà XB</th>
                    <th>Tác giả</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="sach in sachList" :key="sach.MaSach">
                    <td>{{ sach.MaSach }}</td>
                    <td>{{ sach.TenSach }}</td>
                    <td>{{ formatCurrency(sach.DonGia) }}</td>
                    <td>{{ sach.SoQuyen }}</td>
                    <td>{{ sach.NamXuatBan }}</td>
                    <td>{{ sach.NhaXuatBan }}</td>
                    <td>{{ sach.NguonGoc }}</td>
                    <td>
                      <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" @click="editSach(sach)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" @click="deleteSach(sach.MaSach)">
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

const sachList = ref([])
const loading = ref(false)
const searchQuery = ref('')
const showAddModal = ref(false)

// Mock data for now
const mockSach = [
  {
    MaSach: 'S001',
    TenSach: 'Lập trình JavaScript cơ bản',
    DonGia: 150000,
    SoQuyen: 10,
    NamXuatBan: 2023,
    NhaXuatBan: 'NXB Giáo dục',
    NguonGoc: 'Nguyễn Văn A'
  },
  {
    MaSach: 'S002',
    TenSach: 'Cơ sở dữ liệu nâng cao',
    DonGia: 200000,
    SoQuyen: 8,
    NamXuatBan: 2023,
    NhaXuatBan: 'NXB Khoa học',
    NguonGoc: 'Trần Thị B'
  },
  {
    MaSach: 'S003',
    TenSach: 'Mạng máy tính',
    DonGia: 180000,
    SoQuyen: 12,
    NamXuatBan: 2022,
    NhaXuatBan: 'NXB Công nghệ',
    NguonGoc: 'Lê Văn C'
  }
]

const loadSach = async () => {
  loading.value = true
  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500))
    sachList.value = mockSach
  } catch (error) {
    console.error('Error loading sach:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // TODO: Implement search functionality
  console.log('Searching for:', searchQuery.value)
}

const editSach = (sach) => {
  // TODO: Implement edit functionality
  console.log('Editing:', sach)
}

const deleteSach = (maSach) => {
  // TODO: Implement delete functionality
  console.log('Deleting:', maSach)
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount)
}

onMounted(() => {
  loadSach()
})
</script>

<style scoped>
@import '../assets/main_admin.css';
</style>