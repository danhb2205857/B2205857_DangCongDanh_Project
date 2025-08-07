<template>
    <div class="container-fluid">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h2 class="mb-1">
                    <i class="bi bi-clipboard-check me-2"></i>
                    Quản lý phiếu đăng ký mượn sách
                </h2>
                <p class="text-muted mb-0">Duyệt các yêu cầu mượn sách từ độc giả</p>
            </div>
            <div class="d-flex gap-2">
                <button class="btn btn-outline-primary" @click="loadPendingRequests" :disabled="loading">
                    <i class="bi bi-arrow-clockwise me-2"></i>
                    {{ loading ? 'Đang tải...' : 'Làm mới' }}
                </button>
            </div>
        </div>

        <!-- Stats Cards -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Chờ duyệt</h6>
                                <h3 class="mb-0">{{ pendingCount }}</h3>
                            </div>
                            <div class="align-self-center">
                                <i class="bi bi-clock-history fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Đăng ký hôm nay</h6>
                                <h3 class="mb-0">{{ todayRequests }}</h3>
                            </div>
                            <div class="align-self-center">
                                <i class="bi bi-calendar-plus fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-danger text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Cần duyệt gấp</h6>
                                <h3 class="mb-0">{{ urgentRequests }}</h3>
                            </div>
                            <div class="align-self-center">
                                <i class="bi bi-exclamation-triangle fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">Tổng đăng ký</h6>
                                <h3 class="mb-0">{{ totalRequests }}</h3>
                            </div>
                            <div class="align-self-center">
                                <i class="bi bi-list-check fs-1"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Filters -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-4">
                        <label class="form-label">Tìm kiếm</label>
                        <div class="input-group">
                            <span class="input-group-text">
                                <i class="bi bi-search"></i>
                            </span>
                            <input type="text" class="form-control" placeholder="Tìm theo mã, độc giả, sách..."
                                v-model="searchQuery" @input="handleSearch">
                        </div>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Sắp xếp</label>
                        <select class="form-select" v-model="sortOrder" @change="handleSortChange">
                            <option value="newest">Mới nhất</option>
                            <option value="oldest">Cũ nhất</option>
                            <option value="dueDate">Theo ngày hẹn trả</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <label class="form-label">Ngày đăng ký</label>
                        <input type="date" class="form-select" v-model="dateFilter" @change="handleDateFilter">
                    </div>
                    <div class="col-md-2">
                        <label class="form-label">&nbsp;</label>
                        <button class="btn btn-outline-secondary d-block w-100" @click="clearFilters">
                            <i class="bi bi-x-circle me-1"></i>
                            Xóa bộ lọc
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Requests Table -->
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="bi bi-table me-2"></i>
                    Danh sách phiếu đăng ký
                    <span class="badge bg-primary ms-2">{{ filteredRequests.length }}</span>
                </h5>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-hover mb-0">
                        <thead class="table-light">
                            <tr>
                                <th style="width: 120px;">Mã phiếu</th>
                                <th style="width: 150px;">Độc giả</th>
                                <th>Sách</th>
                                <th style="width: 120px;">Ngày đăng ký</th>
                                <th style="width: 120px;">Ngày hẹn trả</th>
                                <th style="width: 200px;" class="text-center">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-if="loading">
                                <td colspan="6" class="text-center py-4">
                                    <div class="spinner-border text-primary" role="status">
                                        <span class="visually-hidden">Đang tải...</span>
                                    </div>
                                    <div class="mt-2">Đang tải dữ liệu...</div>
                                </td>
                            </tr>
                            <tr v-else-if="filteredRequests.length === 0">
                                <td colspan="6" class="text-center text-muted py-4">
                                    <i class="bi bi-inbox display-4 d-block mb-2"></i>
                                    {{ searchQuery ? 'Không tìm thấy phiếu đăng ký nào' : 'Chưa có phiếu đăng ký nào' }}
                                </td>
                            </tr>
                            <tr v-else v-for="request in paginatedRequests" :key="request.MaTheoDoiMuonSach">
                                <td>
                                    <span class="fw-bold">{{ request.MaTheoDoiMuonSach }}</span>
                                </td>
                                <td>
                                    <div>
                                        <div class="fw-medium">{{ getReaderName(request) }}</div>
                                        <small class="text-muted">{{ request.MaDocGia }}</small>
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <div class="fw-medium">{{ getBookTitle(request) }}</div>
                                        <small class="text-muted">{{ request.MaSach }}</small>
                                    </div>
                                </td>
                                <td>{{ formatDate(request.NgayMuon) }}</td>
                                <td>{{ formatDate(request.NgayHenTra) }}</td>
                                <td class="text-center">
                                    <div class="btn-group">
                                        <button class="btn btn-sm btn-success" @click="approveRequest(request)"
                                            :disabled="processing">
                                            <i class="bi bi-check-lg me-1"></i>
                                            Duyệt
                                        </button>
                                        <button class="btn btn-sm btn-danger" @click="rejectRequest(request)"
                                            :disabled="processing">
                                            <i class="bi bi-x-lg me-1"></i>
                                            Từ chối
                                        </button>
                                        <button class="btn btn-sm btn-outline-primary" @click="viewDetails(request)">
                                            <i class="bi bi-eye me-1"></i>
                                            Chi tiết
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="d-flex justify-content-between align-items-center p-3 border-top"
                    v-if="filteredRequests.length > 0">
                    <div class="text-muted">
                        Hiển thị {{ startIndex + 1 }} - {{ Math.min(endIndex, filteredRequests.length) }}
                        trong tổng số {{ filteredRequests.length }} phiếu
                    </div>
                    <nav>
                        <ul class="pagination pagination-sm mb-0">
                            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <button class="page-link" @click="currentPage = 1" :disabled="currentPage === 1">
                                    <i class="bi bi-chevron-double-left"></i>
                                </button>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <button class="page-link" @click="currentPage--" :disabled="currentPage === 1">
                                    <i class="bi bi-chevron-left"></i>
                                </button>
                            </li>
                            <li class="page-item" v-for="page in visiblePages" :key="page"
                                :class="{ active: page === currentPage }">
                                <button class="page-link" @click="currentPage = page">{{ page }}</button>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                <button class="page-link" @click="currentPage++" :disabled="currentPage === totalPages">
                                    <i class="bi bi-chevron-right"></i>
                                </button>
                            </li>
                            <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                <button class="page-link" @click="currentPage = totalPages"
                                    :disabled="currentPage === totalPages">
                                    <i class="bi bi-chevron-double-right"></i>
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>

        <!-- Details Modal -->
        <div class="modal fade" id="detailsModal" tabindex="-1" v-if="showDetailsModal">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-info-circle me-2"></i>
                            Chi tiết phiếu đăng ký
                        </h5>
                        <button type="button" class="btn-close" @click="closeDetailsModal"></button>
                    </div>
                    <div class="modal-body" v-if="viewingRequest">
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Mã phiếu:</strong> {{ viewingRequest.MaTheoDoiMuonSach }}</p>
                                <p><strong>Độc giả:</strong> {{ getReaderName(viewingRequest) }}</p>
                                <p><strong>Mã độc giả:</strong> {{ viewingRequest.MaDocGia }}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Sách:</strong> {{ getBookTitle(viewingRequest) }}</p>
                                <p><strong>Mã sách:</strong> {{ viewingRequest.MaSach }}</p>
                                <p><strong>Trạng thái:</strong>
                                    <span class="badge bg-warning">Chờ duyệt</span>
                                </p>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <p><strong>Ngày đăng ký:</strong> {{ formatDate(viewingRequest.NgayMuon) }}</p>
                            </div>
                            <div class="col-md-6">
                                <p><strong>Ngày hẹn trả:</strong> {{ formatDate(viewingRequest.NgayHenTra) }}</p>
                            </div>
                        </div>
                        <div class="row" v-if="viewingRequest.GhiChu">
                            <div class="col-12">
                                <p><strong>Ghi chú:</strong></p>
                                <div class="border rounded p-2 bg-light">{{ viewingRequest.GhiChu }}</div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeDetailsModal">Đóng</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import api from '../utils/axios.js'

// Reactive data
const requestsList = ref([])
const docGiaList = ref([])
const sachList = ref([])
const loading = ref(false)
const processing = ref(false)
const searchQuery = ref('')
const sortOrder = ref('newest')
const dateFilter = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Modal states
const showDetailsModal = ref(false)
const viewingRequest = ref(null)

// Stats - All requests are pending (isActivate = 0)
const pendingCount = computed(() => requestsList.value.length)
const todayRequests = computed(() => {
    const today = new Date().toDateString()
    return requestsList.value.filter(r =>
        new Date(r.NgayMuon).toDateString() === today
    ).length
})
const urgentRequests = computed(() => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    return requestsList.value.filter(r =>
        new Date(r.NgayHenTra) <= tomorrow
    ).length
})
const totalRequests = computed(() => requestsList.value.length)

// Computed
const filteredRequests = computed(() => {
    if (!Array.isArray(requestsList.value)) return []

    let filtered = requestsList.value

    // Filter by search query
    if (searchQuery.value) {
        const query = searchQuery.value.toLowerCase().trim()
        filtered = filtered.filter(request =>
            request.MaTheoDoiMuonSach.toLowerCase().includes(query) ||
            request.MaDocGia.toLowerCase().includes(query) ||
            request.MaSach.toLowerCase().includes(query) ||
            getReaderName(request).toLowerCase().includes(query) ||
            getBookTitle(request).toLowerCase().includes(query)
        )
    }

    // All requests are already pending (isActivate = 0), no need to filter by status

    // Filter by date
    if (dateFilter.value) {
        const filterDate = new Date(dateFilter.value).toDateString()
        filtered = filtered.filter(request =>
            new Date(request.NgayMuon).toDateString() === filterDate
        )
    }

    // Sort based on selected order
    return filtered.sort((a, b) => {
        switch (sortOrder.value) {
            case 'oldest':
                return new Date(a.NgayMuon) - new Date(b.NgayMuon)
            case 'dueDate':
                return new Date(a.NgayHenTra) - new Date(b.NgayHenTra)
            case 'newest':
            default:
                return new Date(b.NgayMuon) - new Date(a.NgayMuon)
        }
    })
})

const totalPages = computed(() => Math.ceil(filteredRequests.value.length / itemsPerPage.value))
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => startIndex.value + itemsPerPage.value)

const paginatedRequests = computed(() => {
    return filteredRequests.value.slice(startIndex.value, endIndex.value)
})

const visiblePages = computed(() => {
    const pages = []
    const start = Math.max(1, currentPage.value - 2)
    const end = Math.min(totalPages.value, currentPage.value + 2)

    for (let i = start; i <= end; i++) {
        pages.push(i)
    }
    return pages
})

// Methods
const loadPendingRequests = async () => {
    loading.value = true
    try {
        // Load only pending requests (isActivate = 0)
        const response = await api.get('/theodoimuonsach?onlyPending=true')
        if (response.data.success) {
            requestsList.value = response.data.data || []
        }
    } catch (error) {
        console.error('Error loading requests:', error)
        requestsList.value = []
    } finally {
        loading.value = false
    }
}

const loadReferenceData = async () => {
    try {
        // Load DocGia and Sach for display
        const [docGiaResponse, sachResponse] = await Promise.all([
            api.get('/docgia'),
            api.get('/sach')
        ])

        if (docGiaResponse.data.success) {
            docGiaList.value = docGiaResponse.data.data?.docgia || []
        }

        if (sachResponse.data.success) {
            sachList.value = sachResponse.data.data?.sach || []
        }
    } catch (error) {
        console.error('Error loading reference data:', error)
    }
}

const getReaderName = (request) => {
    const docGia = docGiaList.value.find(dg => dg.MaDocGia === request.MaDocGia)
    return docGia ? `${docGia.HoLot} ${docGia.Ten}` : 'Không tìm thấy'
}

const getBookTitle = (request) => {
    const sach = sachList.value.find(s => s.MaSach === request.MaSach)
    return sach ? sach.TenSach : 'Không tìm thấy'
}

const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('vi-VN')
}

const getStatusText = (isActivate) => {
    return isActivate === 0 ? 'Chờ duyệt' : 'Đã duyệt'
}

const getStatusClass = (isActivate) => {
    return isActivate === 0 ? 'bg-warning' : 'bg-success'
}

const approveRequest = async (request) => {
    if (!confirm(`Bạn có chắc chắn muốn duyệt phiếu đăng ký ${request.MaTheoDoiMuonSach}?`)) return

    processing.value = true
    try {
        const response = await api.post(`/theodoimuonsach/${request.MaTheoDoiMuonSach}/approve`)
        if (response.data.success) {
            alert('Duyệt phiếu đăng ký thành công!')
            await loadPendingRequests()
        } else {
            alert('Có lỗi xảy ra: ' + response.data.message)
        }
    } catch (error) {
        console.error('Error approving request:', error)
        alert('Có lỗi xảy ra khi duyệt phiếu đăng ký')
    } finally {
        processing.value = false
    }
}

const rejectRequest = async (request) => {
    if (!confirm(`Bạn có chắc chắn muốn từ chối phiếu đăng ký ${request.MaTheoDoiMuonSach}?`)) return

    processing.value = true
    try {
        const response = await api.delete(`/theodoimuonsach/${request.MaTheoDoiMuonSach}/reject`)
        if (response.data.success) {
            alert('Từ chối phiếu đăng ký thành công!')
            await loadPendingRequests()
        } else {
            alert('Có lỗi xảy ra: ' + response.data.message)
        }
    } catch (error) {
        console.error('Error rejecting request:', error)
        alert('Có lỗi xảy ra khi từ chối phiếu đăng ký')
    } finally {
        processing.value = false
    }
}

const viewDetails = (request) => {
    viewingRequest.value = request
    showDetailsModal.value = true
}

const closeDetailsModal = () => {
    showDetailsModal.value = false
    viewingRequest.value = null
}

const handleSearch = () => {
    currentPage.value = 1
}

const handleSortChange = () => {
    currentPage.value = 1
}

const handleDateFilter = () => {
    currentPage.value = 1
}

const clearFilters = () => {
    searchQuery.value = ''
    sortOrder.value = 'newest'
    dateFilter.value = ''
    currentPage.value = 1
}

// Watch for filter changes
watch([searchQuery, sortOrder, dateFilter], () => {
    currentPage.value = 1
})

// Lifecycle
onMounted(async () => {
    await Promise.all([loadReferenceData(), loadPendingRequests()])
})
</script>

<style scoped>
.card {
    border: none;
    box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table th {
    border-top: none;
    font-weight: 600;
    color: #495057;
    background-color: #f8f9fa;
}

.badge {
    font-size: 0.75em;
}

.btn-group .btn {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
}

.pagination-sm .page-link {
    padding: 0.25rem 0.5rem;
    font-size: 0.875rem;
}

.modal-body p {
    margin-bottom: 0.5rem;
}

.stats-card {
    transition: transform 0.2s;
}

.stats-card:hover {
    transform: translateY(-2px);
}
</style>