<template>
  <div class="dashboard">
    <div class="row mb-4">
      <div class="col-12">
        <h2 class="mb-3">📊 Thống kê tổng quan</h2>
      </div>
    </div>

    <div class="row mb-4">
      <div class="col-md-3 mb-3">
        <div class="card bg-primary text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="card-title">Tổng sách</h4>
                <h2 class="mb-0">{{ stats.totalBooks || 0 }}</h2>
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
                <h4 class="card-title">Độc giả</h4>
                <h2 class="mb-0">{{ stats.totalReaders || 0 }}</h2>
              </div>
              <div class="align-self-center">
                <i class="fas fa-users fa-2x"></i>
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
                <h4 class="card-title">Đang mượn</h4>
                <h2 class="mb-0">{{ stats.activeBorrows || 0 }}</h2>
              </div>
              <div class="align-self-center">
                <i class="fas fa-hand-holding fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-3 mb-3">
        <div class="card bg-info text-white">
          <div class="card-body">
            <div class="d-flex justify-content-between">
              <div>
                <h4 class="card-title">Nhà xuất bản</h4>
                <h2 class="mb-0">{{ stats.totalPublishers || 0 }}</h2>
              </div>
              <div class="align-self-center">
                <i class="fas fa-building fa-2x"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="row">
      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">📚 Sách mới nhất</h5>
          </div>
          <div class="card-body">
            <div v-if="recentBooks.length === 0" class="text-center text-muted">
              <p>Chưa có dữ liệu</p>
            </div>
            <div v-else class="list-group list-group-flush">
              <div v-for="book in recentBooks" :key="book.id" class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-1">{{ book.tenSach }}</h6>
                  <small class="text-muted">{{ book.tacGia }}</small>
                </div>
                <span class="badge bg-primary rounded-pill">{{ book.namXuatBan }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="col-md-6 mb-4">
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">📖 Giao dịch gần đây</h5>
          </div>
          <div class="card-body">
            <div v-if="recentTransactions.length === 0" class="text-center text-muted">
              <p>Chưa có dữ liệu</p>
            </div>
            <div v-else class="list-group list-group-flush">
              <div v-for="transaction in recentTransactions" :key="transaction.id" class="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <h6 class="mb-1">{{ transaction.tenSach }}</h6>
                  <small class="text-muted">{{ transaction.tenDocGia }}</small>
                </div>
                <span :class="getStatusBadgeClass(transaction.trangThai)">
                  {{ getStatusText(transaction.trangThai) }}
                </span>
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

const stats = ref({
  totalBooks: 0,
  totalReaders: 0,
  activeBorrows: 0,
  totalPublishers: 0
})

const recentBooks = ref([])
const recentTransactions = ref([])

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'muon':
      return 'badge bg-warning rounded-pill'
    case 'tra':
      return 'badge bg-success rounded-pill'
    default:
      return 'badge bg-secondary rounded-pill'
  }
}

const getStatusText = (status) => {
  switch (status) {
    case 'muon':
      return 'Mượn'
    case 'tra':
      return 'Trả'
    default:
      return 'Không xác định'
  }
}

const fetchDashboardData = async () => {
  try {
    // TODO: Implement API calls to fetch dashboard data
    // For now, using mock data
    stats.value = {
      totalBooks: 1250,
      totalReaders: 450,
      activeBorrows: 89,
      totalPublishers: 25
    }

    recentBooks.value = [
      { id: 1, tenSach: 'Đắc Nhân Tâm', tacGia: 'Dale Carnegie', namXuatBan: 2024 },
      { id: 2, tenSach: 'Nhà Giả Kim', tacGia: 'Paulo Coelho', namXuatBan: 2024 },
      { id: 3, tenSach: 'Tuổi Trẻ Đáng Giá Bao Nhiêu', tacGia: 'Rosie Nguyễn', namXuatBan: 2023 }
    ]

    recentTransactions.value = [
      { id: 1, tenSach: 'Đắc Nhân Tâm', tenDocGia: 'Nguyễn Văn A', trangThai: 'muon' },
      { id: 2, tenSach: 'Nhà Giả Kim', tenDocGia: 'Trần Thị B', trangThai: 'tra' },
      { id: 3, tenSach: 'Tuổi Trẻ Đáng Giá Bao Nhiêu', tenDocGia: 'Lê Văn C', trangThai: 'muon' }
    ]
  } catch (error) {
    console.error('Error fetching dashboard data:', error)
  }
}

onMounted(() => {
  fetchDashboardData()
})
</script>

<style scoped>
.dashboard {
  padding: 20px 0;
}

.card {
  border: none;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-2px);
}

.list-group-item {
  border: none;
  border-bottom: 1px solid #eee;
}

.list-group-item:last-child {
  border-bottom: none;
}
</style> 