<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h5 class="card-title mb-0">Theo dõi mượn sách</h5>
          </div>
          <div class="card-body">
            <div class="row mb-3">
              <div class="col-md-4">
                <input 
                  type="text" 
                  class="form-control" 
                  placeholder="Tìm kiếm theo độc giả..."
                  v-model="searchQuery"
                  @input="handleSearch"
                >
              </div>
              <div class="col-md-4">
                <select class="form-select" v-model="statusFilter">
                  <option value="">Tất cả trạng thái</option>
                  <option value="muon">Đang mượn</option>
                  <option value="tra">Đã trả</option>
                </select>
              </div>
              <div class="col-md-4 text-end">
                <button class="btn btn-primary" @click="showAddModal = true">
                  <i class="bi bi-plus-circle me-2"></i>Mượn sách mới
                </button>
              </div>
            </div>
            
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                  <tr>
                    <th>Mã độc giả</th>
                    <th>Tên độc giả</th>
                    <th>Tên sách</th>
                    <th>Ngày mượn</th>
                    <th>Ngày trả</th>
                    <th>Trạng thái</th>
                    <th>Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="record in filteredRecords" :key="record.id">
                    <td>{{ record.MaDocGia }}</td>
                    <td>{{ record.TenDocGia }}</td>
                    <td>{{ record.TenSach }}</td>
                    <td>{{ formatDate(record.NgayMuon) }}</td>
                    <td>{{ record.NgayTra ? formatDate(record.NgayTra) : '-' }}</td>
                    <td>
                      <span :class="getStatusClass(record.TrangThai)">
                        {{ getStatusText(record.TrangThai) }}
                      </span>
                    </td>
                    <td>
                      <div class="btn-group">
                        <button 
                          v-if="record.TrangThai === 'muon'" 
                          class="btn btn-sm btn-outline-success" 
                          @click="returnBook(record)"
                        >
                          <i class="bi bi-check-circle me-1"></i>Trả sách
                        </button>
                        <button class="btn btn-sm btn-outline-primary" @click="editRecord(record)">
                          <i class="bi bi-pencil"></i>
                        </button>
                        <button class="btn btn-sm btn-outline-danger" @click="deleteRecord(record.id)">
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
import { ref, computed, onMounted } from 'vue'

const recordList = ref([])
const loading = ref(false)
const searchQuery = ref('')
const statusFilter = ref('')
const showAddModal = ref(false)

// Mock data for now
const mockRecords = [
  {
    id: 1,
    MaDocGia: 'DG001',
    TenDocGia: 'Nguyễn Văn An',
    MaSach: 'S001',
    TenSach: 'Lập trình JavaScript',
    NgayMuon: '2024-01-15',
    NgayTra: null,
    TrangThai: 'muon'
  },
  {
    id: 2,
    MaDocGia: 'DG002',
    TenDocGia: 'Trần Thị Bình',
    MaSach: 'S002',
    TenSach: 'Cơ sở dữ liệu',
    NgayMuon: '2024-01-10',
    NgayTra: '2024-01-20',
    TrangThai: 'tra'
  },
  {
    id: 3,
    MaDocGia: 'DG001',
    TenDocGia: 'Nguyễn Văn An',
    MaSach: 'S003',
    TenSach: 'Mạng máy tính',
    NgayMuon: '2024-01-12',
    NgayTra: null,
    TrangThai: 'muon'
  }
]

const filteredRecords = computed(() => {
  let filtered = recordList.value

  if (searchQuery.value) {
    filtered = filtered.filter(record => 
      record.TenDocGia.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      record.MaDocGia.toLowerCase().includes(searchQuery.value.toLowerCase())
    )
  }

  if (statusFilter.value) {
    filtered = filtered.filter(record => record.TrangThai === statusFilter.value)
  }

  return filtered
})

const loadRecords = async () => {
  loading.value = true
  try {
    // TODO: Replace with actual API call
    await new Promise(resolve => setTimeout(resolve, 500))
    recordList.value = mockRecords
  } catch (error) {
    console.error('Error loading records:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  // Search is handled by computed property
}

const returnBook = async (record) => {
  try {
    // TODO: Implement actual return book API call
    record.NgayTra = new Date().toISOString().split('T')[0]
    record.TrangThai = 'tra'
    console.log('Book returned:', record)
  } catch (error) {
    console.error('Error returning book:', error)
  }
}

const editRecord = (record) => {
  // TODO: Implement edit functionality
  console.log('Editing:', record)
}

const deleteRecord = (id) => {
  // TODO: Implement delete functionality
  console.log('Deleting:', id)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN')
}

const getStatusClass = (status) => {
  return status === 'muon' ? 'badge bg-warning' : 'badge bg-success'
}

const getStatusText = (status) => {
  return status === 'muon' ? 'Đang mượn' : 'Đã trả'
}

onMounted(() => {
  loadRecords()
})
</script>

<style scoped>
@import '../assets/main_admin.css';
</style>