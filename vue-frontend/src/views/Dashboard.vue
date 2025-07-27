<template>
  <div class="container-fluid">
    <!-- Stats Cards Row -->
    <div class="row mb-4">
      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card border-left-primary shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                  Tổng số sách
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">{{ stats.totalBooks }}</div>
              </div>
              <div class="col-auto">
                <i class="bi bi-book text-primary" style="font-size: 2rem;"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card border-left-success shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                  Tổng độc giả
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">{{ stats.totalReaders }}</div>
              </div>
              <div class="col-auto">
                <i class="bi bi-people text-success" style="font-size: 2rem;"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card border-left-info shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                  Sách đang mượn
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">{{ stats.borrowedBooks }}</div>
              </div>
              <div class="col-auto">
                <i class="bi bi-arrow-repeat text-info" style="font-size: 2rem;"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-xl-3 col-md-6 mb-4">
        <div class="card border-left-warning shadow h-100 py-2">
          <div class="card-body">
            <div class="row no-gutters align-items-center">
              <div class="col mr-2">
                <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                  Nhà xuất bản
                </div>
                <div class="h5 mb-0 font-weight-bold text-gray-800">{{ stats.totalPublishers }}</div>
              </div>
              <div class="col-auto">
                <i class="bi bi-building text-warning" style="font-size: 2rem;"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Activities Row -->
    <div class="row">
      <div class="col-lg-6 mb-4">
        <div class="card shadow">
          <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Sách mới nhất</h6>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Tên sách</th>
                    <th>Tác giả</th>
                    <th>Năm XB</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="book in recentBooks" :key="book.MaSach">
                    <td>{{ book.TenSach }}</td>
                    <td>{{ book.NguonGoc }}</td>
                    <td>{{ book.NamXuatBan }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6 mb-4">
        <div class="card shadow">
          <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Hoạt động mượn sách gần đây</h6>
          </div>
          <div class="card-body">
            <div class="table-responsive">
              <table class="table table-sm">
                <thead>
                  <tr>
                    <th>Độc giả</th>
                    <th>Sách</th>
                    <th>Ngày mượn</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="activity in recentActivities" :key="activity.id">
                    <td>{{ activity.docgia }}</td>
                    <td>{{ activity.sach }}</td>
                    <td>{{ formatDate(activity.ngayMuon) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const stats = ref({
  totalBooks: 0,
  totalReaders: 0,
  borrowedBooks: 0,
  totalPublishers: 0
})

const recentBooks = ref([])
const recentActivities = ref([])

// Mock data
const mockStats = {
  totalBooks: 1250,
  totalReaders: 340,
  borrowedBooks: 89,
  totalPublishers: 45
}

const mockRecentBooks = [
  { MaSach: 'S001', TenSach: 'Lập trình JavaScript', NguonGoc: 'Nguyễn Văn A', NamXuatBan: 2023 },
  { MaSach: 'S002', TenSach: 'Cơ sở dữ liệu', NguonGoc: 'Trần Thị B', NamXuatBan: 2023 },
  { MaSach: 'S003', TenSach: 'Mạng máy tính', NguonGoc: 'Lê Văn C', NamXuatBan: 2022 }
]

const mockRecentActivities = [
  { id: 1, docgia: 'Nguyễn Văn An', sach: 'Lập trình JavaScript', ngayMuon: '2024-01-15' },
  { id: 2, docgia: 'Trần Thị Bình', sach: 'Cơ sở dữ liệu', ngayMuon: '2024-01-14' },
  { id: 3, docgia: 'Lê Văn Cường', sach: 'Mạng máy tính', ngayMuon: '2024-01-13' }
]

const loadDashboardData = async () => {
  try {
    // TODO: Replace with actual API calls
    await new Promise(resolve => setTimeout(resolve, 500))
    
    stats.value = mockStats
    recentBooks.value = mockRecentBooks
    recentActivities.value = mockRecentActivities
  } catch (error) {
    console.error('Error loading dashboard data:', error)
  }
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('vi-VN')
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
@import '../assets/main_admin.css';

.border-left-primary {
  border-left: 0.25rem solid #4e73df !important;
}

.border-left-success {
  border-left: 0.25rem solid #1cc88a !important;
}

.border-left-info {
  border-left: 0.25rem solid #36b9cc !important;
}

.border-left-warning {
  border-left: 0.25rem solid #f6c23e !important;
}

.text-xs {
  font-size: 0.7rem;
}

.text-gray-800 {
  color: #5a5c69 !important;
}

.shadow {
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15) !important;
}
</style>