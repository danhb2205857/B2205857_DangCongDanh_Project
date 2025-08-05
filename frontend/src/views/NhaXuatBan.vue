<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Quản lý nhà xuất bản</h5>
          </div>
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-md-6">
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Tìm kiếm nhà xuất bản..."
                  v-model="searchQuery"
                  @input="handleSearch"
                >
              </div>
              <div class="col-md-6 text-end">
                <button class="btn btn-primary" @click="showAddModal = true">
                  <i class="bi bi-plus-circle me-2"></i>Thêm nhà xuất bản
                </button>
              </div>
            </div>
            
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Mã NXB</th>
                    <th>Tên nhà xuất bản</th>
                    <th>Địa chỉ</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="nxb in nxbList" :key="nxb.MaNXB">
                    <td>{{ nxb.MaNXB }}</td>
                    <td>{{ nxb.TenNXB }}</td>
                    <td>{{ nxb.DiaChi }}</td>
                    <td>
                      <div class="btn-group">
                        <button class="btn btn-sm btn-outline-primary" @click="editNXB(nxb)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" @click="deleteNXB(nxb.MaNXB)">
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

const nxbList = ref([])
const loading = ref(false)
const searchQuery = ref('')
const showAddModal = ref(false)

// Mock data for now
const mockNXB = [
  {
    MaNXB: 'NXB001',
    TenNXB: 'Nhà xuất bản Giáo dục Việt Nam',
    DiaChi: '81 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội'
  },
  {
    MaNXB: 'NXB002',
    TenNXB: 'Nhà xuất bản Khoa học và Kỹ thuật',
    DiaChi: '70 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội'
  },
  {
    MaNXB: 'NXB003',
    TenNXB: 'Nhà xuất bản Công nghệ thông tin',
    DiaChi: '123 Lê Lợi, Quận 1, TP.HCM'
  }
]

const loadNXB = async () => {
  loading.value = true
  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500))
    nxbList.value = mockNXB
  } catch (error) {
    console.error('Error loading NXB:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // TODO: Implement search functionality
  console.log('Searching for:', searchQuery.value)
}

const editNXB = (nxb) => {
  // TODO: Implement edit functionality
  console.log('Editing:', nxb)
}

const deleteNXB = (maNXB) => {
  // TODO: Implement delete functionality
  console.log('Deleting:', maNXB)
}

onMounted(() => {
  loadNXB()
})
</script>

<style scoped>
@import '@/assets/styles/main.css';
</style>