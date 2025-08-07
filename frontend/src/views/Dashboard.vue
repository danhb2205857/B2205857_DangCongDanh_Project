<template>
  <div class="container-fluid">
    <!-- Page Header -->
    <div class="d-sm-flex align-items-center justify-content-between mb-4">
      <h1 class="h3 mb-0 text-gray-800">Dashboard</h1>
      <button @click="refreshData" class="btn btn-primary btn-sm shadow-sm" :disabled="loading">
        <i class="bi bi-arrow-clockwise"></i>
        {{ loading ? 'Đang tải...' : 'Làm mới' }}
      </button>
    </div>

    <!-- Stats Cards Row -->
    <div class="row mb-4">
      <StatsCard
        title="Tổng số sách"
        :value="stats.overview?.totalBooks || 0"
        :subtitle="`${stats.overview?.totalQuantity || 0} quyển`"
        icon="bi bi-book"
        color="primary"
      />
      
      <StatsCard
        title="Tổng độc giả"
        :value="stats.overview?.totalReaders || 0"
        :subtitle="`${stats.today?.newReaders || 0} mới hôm nay`"
        icon="bi bi-people"
        color="success"
      />
      
      <StatsCard
        title="Sách đang mượn"
        :value="stats.overview?.activeBorrows || 0"
        :subtitle="`${stats.overview?.overdueBorrows || 0} quá hạn`"
        icon="bi bi-arrow-repeat"
        color="info"
      />
      
      <StatsCard
        title="Nhà xuất bản"
        :value="stats.overview?.totalPublishers || 0"
        :subtitle="`${stats.overview?.availableBooks || 0} sách có sẵn`"
        icon="bi bi-building"
        color="warning"
      />
    </div>

    <!-- Today's Stats Row -->
    <div class="row mb-4">
      <div class="col-lg-6 mb-4">
        <div class="card shadow">
          <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Thống kê mượn/trả 7 ngày gần nhất</h6>
          </div>
          <div class="card-body">
            <DashboardChart :chartData="chartData" :options="chartOptions" type="bar" />
          </div>
        </div>
      </div>
      <div class="col-lg-6 mb-4">
        <div class="card shadow">
          <div class="card-header py-3">
            <h6 class="m-0 font-weight-bold text-primary">Thống kê hôm nay</h6>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-4 text-center">
                <div class="h4 mb-0 text-primary">{{ stats.today?.borrows || 0 }}</div>
                <div class="text-xs text-uppercase">Lượt mượn</div>
              </div>
              <div class="col-md-4 text-center">
                <div class="h4 mb-0 text-success">{{ stats.today?.returns || 0 }}</div>
                <div class="text-xs text-uppercase">Lượt trả</div>
              </div>
              <div class="col-md-4 text-center">
                <div class="h4 mb-0 text-info">{{ stats.today?.newReaders || 0 }}</div>
                <div class="text-xs text-uppercase">Độc giả mới</div>
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
          <div class="card-header py-3 d-flex justify-content-between align-items-center">
            <h6 class="m-0 font-weight-bold text-primary">Sách mới nhất</h6>
            <router-link to="/admin/sach" class="btn btn-sm btn-outline-primary">
              Xem tất cả
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-3">
              <div class="spinner-border spinner-border-sm" role="status">
                <span class="sr-only">Đang tải...</span>
              </div>
            </div>
            <div v-else-if="recentBooks.length === 0" class="text-center py-3 text-muted">
              Chưa có dữ liệu
            </div>
            <div v-else class="table-responsive">
              <table class="table table-sm table-hover">
                <thead>
                  <tr>
                    <th>Tên sách</th>
                    <th>Tác giả</th>
                    <th>Năm XB</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="book in recentBooks" :key="book.MaSach">
                    <td>
                      <div class="font-weight-bold">{{ book.TenSach }}</div>
                      <small class="text-muted">{{ book.MaSach }}</small>
                    </td>
                    <td>{{ book.TacGia || book.NguonGoc }}</td>
                    <td>
                      <span class="badge badge-secondary">{{ book.NamXuatBan }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <div class="col-lg-6 mb-4">
        <div class="card shadow">
          <div class="card-header py-3 d-flex justify-content-between align-items-center">
            <h6 class="m-0 font-weight-bold text-primary">Hoạt động mượn sách gần đây</h6>
            <router-link to="/admin/theodoimuonsach" class="btn btn-sm btn-outline-primary">
              Xem tất cả
            </router-link>
          </div>
          <div class="card-body">
            <div v-if="loading" class="text-center py-3">
              <div class="spinner-border spinner-border-sm" role="status">
                <span class="sr-only">Đang tải...</span>
              </div>
            </div>
            <div v-else-if="recentTransactions.length === 0" class="text-center py-3 text-muted">
              Chưa có hoạt động
            </div>
            <div v-else class="table-responsive">
              <table class="table table-sm table-hover">
                <thead>
                  <tr>
                    <th>Độc giả</th>
                    <th>Sách</th>
                    <th>Trạng thái</th>
                    <th>Ngày</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="transaction in recentTransactions" :key="transaction.MaTheoDoiMuonSach">
                    <td>
                      <div class="font-weight-bold">
                        {{ getReaderName(transaction.MaDocGia) }}
                      </div>
                      <small class="text-muted">
                        <template v-if="typeof transaction.MaDocGia === 'object' && transaction.MaDocGia && transaction.MaDocGia.MaDocGia">
                          {{ transaction.MaDocGia.MaDocGia }}
                        </template>
                        <template v-else-if="typeof transaction.MaDocGia === 'string'">
                          {{ transaction.MaDocGia }}
                        </template>
                      </small>
                    </td>
                    <td>
                      <div>{{ getBookTitle(transaction.MaSach) }}</div>
                    </td>
                    <td>
                      <span :class="getStatusBadgeClass(transaction.TrangThai)">
                        {{ transaction.TrangThai }}
                      </span>
                    </td>
                    <td>
                      <small>{{ formatDate(transaction.NgayTra || transaction.NgayMuon) }}</small>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    

    <!-- Overdue Books Alert -->
    <div v-if="stats.overview?.overdueBorrows > 0" class="row">
      <div class="col-12">
        <div class="alert alert-warning shadow">
          <div class="d-flex align-items-center">
            <i class="bi bi-exclamation-triangle-fill me-2"></i>
            <div>
              <strong>Cảnh báo:</strong> 
              Có {{ stats.overview.overdueBorrows }} sách đang quá hạn trả.
              <router-link to="/admin/theodoimuonsach?status=qua_han" class="alert-link ms-2">
                Xem chi tiết →
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import api from '../utils/axios.js'
import StatsCard from '../components/StatsCard.vue'
import DashboardChart from '../components/DashboardChart.vue'

const loading = ref(false)
const stats = ref({
  overview: {},
  today: {}
})
const recentBooks = ref([])
const recentTransactions = ref([])
const recentReaders = ref([])
const chartData = ref({
  labels: [],
  datasets: []
})
const chartOptions = ref({
  responsive: true,
  plugins: {
    legend: { position: 'top' },
    title: { display: true, text: 'Thống kê mượn/trả sách 7 ngày gần nhất' }
  }
})

const loadDashboardStats = async () => {
  try {
    const response = await api.get('/dashboard/stats')
    if (response.data.success) {
      stats.value = response.data.data
    }
  } catch (error) {
    console.error('Error loading dashboard stats:', error)
    // Nếu lỗi, chỉ log lỗi, không dùng dữ liệu mock nữa
    stats.value = { overview: {}, today: {} }
  }
}

const loadRecentActivities = async () => {
  try {
    const response = await api.get('/dashboard/recent-activities?limit=5')
    if (response.data.success) {
      const data = response.data.data
      recentBooks.value = data.recentBooks || []
      recentTransactions.value = data.recentTransactions || []
      recentReaders.value = data.recentReaders || []
    }
  } catch (error) {
    console.error('Error loading recent activities:', error)
    // Nếu lỗi, chỉ log lỗi, không dùng dữ liệu mock nữa
    recentBooks.value = []
    recentTransactions.value = []
    recentReaders.value = []
  }
}

const loadChartData = async () => {
  try {
    // Use the correct endpoint for chart data
    const response = await api.get('/dashboard/charts?period=7days')
    if (response.data.success) {
      const data = response.data.data;
      // Defensive: ensure data.borrowTrends exists and is an array
      const trends = Array.isArray(data.borrowTrends) ? data.borrowTrends : [];
      chartData.value = {
        labels: trends.map(item => item._id),
        datasets: [
          {
            label: 'Lượt mượn',
            backgroundColor: '#36b9cc',
            borderColor: '#36b9cc',
            data: trends.map(item => item.borrows),
            type: 'bar'
          },
          {
            label: 'Lượt trả',
            backgroundColor: '#1cc88a',
            borderColor: '#1cc88a',
            data: trends.map(item => item.returns),
            type: 'bar'
          }
        ]
      }
    }
  } catch (error) {
    // Nếu lỗi, chỉ log lỗi, không dùng dữ liệu mock nữa
    chartData.value = { labels: [], datasets: [] }
  }
}

const loadDashboardData = async () => {
  loading.value = true
  try {
    await Promise.all([
      loadDashboardStats(),
      loadRecentActivities(),
      loadChartData()
    ])
  } finally {
    loading.value = false
  }
}

const refreshData = () => {
  loadDashboardData()
}

const formatDate = (dateString) => {
  if (!dateString) return '-'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

const getReaderName = (docgia) => {
  if (typeof docgia === 'object' && docgia !== null) {
    // Ưu tiên hiện tên đầy đủ nếu có
    if (docgia.HoLot || docgia.Ten) {
      return `${docgia.HoLot ? docgia.HoLot : ''} ${docgia.Ten ? docgia.Ten : ''}`.trim();
    }
    // Nếu không có tên, thử hiện MaDocGia
    if (docgia.MaDocGia) return docgia.MaDocGia;
    // Nếu là object nhưng không có gì, stringify
    return JSON.stringify(docgia);
  }
  return docgia || '-';
}

const getBookTitle = (sach) => {
  if (typeof sach === 'object' && sach !== null) {
    return sach.TenSach || '-'
  }
  return sach || '-'
}

const getStatusBadgeClass = (status) => {
  const classes = {
    'Đang mượn': 'badge badge-info',
    'Đã trả': 'badge badge-success',
    'Quá hạn': 'badge badge-danger',
    'qua_han': 'badge badge-danger',
    'muon': 'badge badge-info',
    'da_tra': 'badge badge-success'
  }
  return classes[status] || 'badge badge-secondary'
}

onMounted(() => {
  loadDashboardData()
})
</script>

<style scoped>
@import '@/assets/styles/main.css';

.text-xs {
  font-size: 0.7rem;
}

.text-gray-800 {
  color: #5a5c69 !important;
}

.shadow {
  box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15) !important;
}

.table-hover tbody tr:hover {
  background-color: rgba(0, 0, 0, 0.075);
}

.badge {
  font-size: 0.75em;
  padding: 0.25em 0.5em;
  border-radius: 0.375rem;
}

.badge-info {
  color: #fff;
  background-color: #36b9cc;
}

.badge-success {
  color: #fff;
  background-color: #1cc88a;
}

.badge-danger {
  color: #fff;
  background-color: #e74a3b;
}

.badge-secondary {
  color: #fff;
  background-color: #858796;
}

.alert-warning {
  color: #856404;
  background-color: #fff3cd;
  border-color: #ffeaa7;
}

.btn-outline-primary {
  color: #4e73df;
  border-color: #4e73df;
}

.btn-outline-primary:hover {
  color: #fff;
  background-color: #4e73df;
  border-color: #4e73df;
}

.spinner-border-sm {
  width: 1rem;
  height: 1rem;
}

.me-2 {
  margin-right: 0.5rem !important;
}

.ms-2 {
  margin-left: 0.5rem !important;
}
</style>