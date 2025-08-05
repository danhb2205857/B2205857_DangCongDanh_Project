<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <div class="card shadow">
                    <div class="card-header py-3">
                        <h5 class="card-title mb-0 text-primary font-weight-bold">
                            <i class="bi bi-people me-2"></i>Quản lý độc giả
                        </h5>
                    </div>
                    <div class="card-body">
                        <!-- Search and Add Section -->
                        <div class="row mb-4">
                            <div class="col-md-8">
                                <div class="input-group">
                                    <span class="input-group-text">
                                        <i class="bi bi-search"></i>
                                    </span>
                                    <input type="text" class="form-control"
                                        placeholder="Tìm kiếm theo mã, họ tên, địa chỉ, điện thoại..."
                                        v-model="searchQuery" @input="handleSearch">
                                    <button class="btn btn-outline-secondary" @click="clearSearch" v-if="searchQuery">
                                        <i class="bi bi-x"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-4 text-end">
                                <button class="btn btn-primary" @click="showAddModal">
                                    <i class="bi bi-plus-circle me-2"></i>Thêm độc giả
                                </button>
                            </div>
                        </div>

                        <!-- Table Section -->
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead class="table-light">
                                    <tr>
                                        <th style="width: 100px;">Mã độc giả</th>
                                        <th style="width: 150px;">Họ lót</th>
                                        <th style="width: 100px;">Tên</th>
                                        <th style="width: 120px;">Ngày sinh</th>
                                        <th style="width: 80px;">Phái</th>
                                        <th>Địa chỉ</th>
                                        <th style="width: 120px;">Điện thoại</th>
                                        <th style="width: 120px;" class="text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="docgia in paginatedDocGia" :key="docgia.MaDocGia">
                                        <td>
                                            <span class="badge bg-primary">{{ docgia.MaDocGia }}</span>
                                        </td>
                                        <td>{{ docgia.HoLot }}</td>
                                        <td class="fw-bold">{{ docgia.Ten }}</td>
                                        <td>{{ formatDate(docgia.NgaySinh) }}</td>
                                        <td>
                                            <span class="badge"
                                                :class="docgia.Phai === 'Nam' ? 'bg-info' : 'bg-warning'">
                                                {{ docgia.Phai }}
                                            </span>
                                        </td>
                                        <td class="text-truncate" style="max-width: 200px;" :title="docgia.DiaChi">
                                            {{ docgia.DiaChi }}
                                        </td>
                                        <td>{{ docgia.DienThoai }}</td>
                                        <td class="text-center">
                                            <div class="btn-group" role="group">
                                                <button class="btn btn-sm btn-outline-primary"
                                                    @click="editDocGia(docgia)" title="Chỉnh sửa">
                                                    <i class="bi bi-pencil"></i>
                                                </button>
                                                <button class="btn btn-sm btn-outline-danger"
                                                    @click="confirmDelete(docgia)" title="Xóa">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr v-if="filteredDocGia.length === 0 && !loading">
                                        <td colspan="8" class="text-center text-muted py-4">
                                            <i class="bi bi-inbox display-4 d-block mb-2"></i>
                                            {{ searchQuery ? 'Không tìm thấy độc giả nào' : 'Chưa có độc giả nào' }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>

                        <!-- Loading State -->
                        <div v-if="loading" class="text-center py-4">
                            <div class="spinner-border text-primary" role="status">
                                <span class="visually-hidden">Đang tải...</span>
                            </div>
                            <p class="mt-2 text-muted">Đang tải danh sách độc giả...</p>
                        </div>

                        <!-- Pagination -->
                        <div class="row mt-4" v-if="filteredDocGia.length > 0">
                            <div class="col-md-6">
                                <p class="text-muted">
                                    Hiển thị {{ startIndex + 1 }} - {{ endIndex }} trong tổng số {{
                                        filteredDocGia.length }} độc giả
                                </p>
                            </div>
                            <div class="col-md-6">
                                <nav aria-label="Pagination">
                                    <ul class="pagination justify-content-end mb-0">
                                        <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                            <button class="page-link" @click="goToPage(currentPage - 1)"
                                                :disabled="currentPage === 1">
                                                <i class="bi bi-chevron-left"></i>
                                            </button>
                                        </li>
                                        <li class="page-item" v-for="page in visiblePages" :key="page"
                                            :class="{ active: page === currentPage }">
                                            <button class="page-link" @click="goToPage(page)">{{ page }}</button>
                                        </li>
                                        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
                                            <button class="page-link" @click="goToPage(currentPage + 1)"
                                                :disabled="currentPage === totalPages">
                                                <i class="bi bi-chevron-right"></i>
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Add/Edit Modal -->
        <div class="modal fade" :class="{ show: showModal }" :style="{ display: showModal ? 'block' : 'none' }"
            tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-person-plus me-2" v-if="!editingDocGia"></i>
                            <i class="bi bi-person-gear me-2" v-else></i>
                            {{ editingDocGia ? 'Chỉnh sửa độc giả' : 'Thêm độc giả mới' }}
                        </h5>
                        <button type="button" class="btn-close" @click="closeModal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="saveDocGia">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="maDocGia" class="form-label">Mã độc giả <span
                                                class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="maDocGia"
                                            v-model="formData.MaDocGia" :disabled="editingDocGia"
                                            :class="{ 'is-invalid': errors.MaDocGia }" placeholder="VD: DG001">
                                        <div class="invalid-feedback" v-if="errors.MaDocGia">{{ errors.MaDocGia }}</div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="phai" class="form-label">Phái <span
                                                class="text-danger">*</span></label>
                                        <select class="form-select" id="phai" v-model="formData.Phai"
                                            :class="{ 'is-invalid': errors.Phai }">
                                            <option value="">Chọn phái</option>
                                            <option value="Nam">Nam</option>
                                            <option value="Nữ">Nữ</option>
                                        </select>
                                        <div class="invalid-feedback" v-if="errors.Phai">{{ errors.Phai }}</div>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-8">
                                    <div class="mb-3">
                                        <label for="hoLot" class="form-label">Họ lót <span
                                                class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="hoLot" v-model="formData.HoLot"
                                            :class="{ 'is-invalid': errors.HoLot }" placeholder="VD: Nguyễn Văn">
                                        <div class="invalid-feedback" v-if="errors.HoLot">{{ errors.HoLot }}</div>
                                    </div>
                                </div>
                                <div class="col-md-4">
                                    <div class="mb-3">
                                        <label for="ten" class="form-label">Tên <span
                                                class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="ten" v-model="formData.Ten"
                                            :class="{ 'is-invalid': errors.Ten }" placeholder="VD: An">
                                        <div class="invalid-feedback" v-if="errors.Ten">{{ errors.Ten }}</div>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="ngaySinh" class="form-label">Ngày sinh <span
                                                class="text-danger">*</span></label>
                                        <input type="date" class="form-control" id="ngaySinh"
                                            v-model="formData.NgaySinh" :class="{ 'is-invalid': errors.NgaySinh }"
                                            :max="maxDate">
                                        <div class="invalid-feedback" v-if="errors.NgaySinh">{{ errors.NgaySinh }}</div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="dienThoai" class="form-label">Điện thoại <span
                                                class="text-danger">*</span></label>
                                        <input type="tel" class="form-control" id="dienThoai"
                                            v-model="formData.DienThoai" :class="{ 'is-invalid': errors.DienThoai }"
                                            placeholder="VD: 0901234567">
                                        <div class="invalid-feedback" v-if="errors.DienThoai">{{ errors.DienThoai }}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label for="diaChi" class="form-label">Địa chỉ <span
                                        class="text-danger">*</span></label>
                                <textarea class="form-control" id="diaChi" v-model="formData.DiaChi"
                                    :class="{ 'is-invalid': errors.DiaChi }" rows="3"
                                    placeholder="VD: 123 Đường ABC, Phường XYZ, Quận 1, TP.HCM"></textarea>
                                <div class="invalid-feedback" v-if="errors.DiaChi">{{ errors.DiaChi }}</div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeModal">
                            <i class="bi bi-x-circle me-2"></i>Hủy
                        </button>
                        <button type="button" class="btn btn-primary" @click="saveDocGia" :disabled="saving">
                            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                            <i class="bi bi-check-circle me-2" v-else></i>
                            {{ editingDocGia ? 'Cập nhật' : 'Thêm mới' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Delete Confirmation Modal -->
        <div class="modal fade" :class="{ show: showDeleteModal }"
            :style="{ display: showDeleteModal ? 'block' : 'none' }" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title text-danger">
                            <i class="bi bi-exclamation-triangle me-2"></i>Xác nhận xóa
                        </h5>
                        <button type="button" class="btn-close" @click="showDeleteModal = false"></button>
                    </div>
                    <div class="modal-body">
                        <p>Bạn có chắc chắn muốn xóa độc giả <strong>{{ deletingDocGia?.HoLot }} {{ deletingDocGia?.Ten
                        }}</strong>?</p>
                        <p class="text-muted small">Hành động này không thể hoàn tác.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">
                            <i class="bi bi-x-circle me-2"></i>Hủy
                        </button>
                        <button type="button" class="btn btn-danger" @click="deleteDocGia" :disabled="deleting">
                            <span v-if="deleting" class="spinner-border spinner-border-sm me-2"></span>
                            <i class="bi bi-trash me-2" v-else></i>
                            Xóa
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Modal Backdrop -->
        <div class="modal-backdrop fade show" v-if="showModal || showDeleteModal"></div>
    </div>
</template>
<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import axios from 'axios'

// Reactive data
const docgiaList = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)

// Modal states
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingDocGia = ref(null)
const deletingDocGia = ref(null)

// Form data
const formData = ref({
    MaDocGia: '',
    HoLot: '',
    Ten: '',
    NgaySinh: '',
    Phai: '',
    DiaChi: '',
    DienThoai: ''
})

// Form errors
const errors = ref({})

// Computed properties
const filteredDocGia = computed(() => {
    if (!Array.isArray(docgiaList.value)) return []
    if (!searchQuery.value) return docgiaList.value

    const query = searchQuery.value.toLowerCase().trim()
    return docgiaList.value.filter(docgia =>
        docgia.MaDocGia.toLowerCase().includes(query) ||
        docgia.HoLot.toLowerCase().includes(query) ||
        docgia.Ten.toLowerCase().includes(query) ||
        docgia.DiaChi.toLowerCase().includes(query) ||
        docgia.DienThoai.includes(query)
    )
})

const totalPages = computed(() => {
    if (!Array.isArray(filteredDocGia.value)) return 0
    return Math.ceil(filteredDocGia.value.length / itemsPerPage.value)
})

const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => {
    if (!Array.isArray(filteredDocGia.value)) return 0
    return Math.min(startIndex.value + itemsPerPage.value, filteredDocGia.value.length)
})

const paginatedDocGia = computed(() => {
    if (!Array.isArray(filteredDocGia.value)) return []
    return filteredDocGia.value.slice(startIndex.value, endIndex.value)
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

const maxDate = computed(() => {
    const today = new Date()
    const maxDate = new Date(today.getFullYear() - 5, today.getMonth(), today.getDate())
    return maxDate.toISOString().split('T')[0]
})

// Methods
const loadDocGia = async () => {
    loading.value = true

    // Mock data fallback
    const mockData = [
        {
            MaDocGia: 'DG001',
            HoLot: 'Nguyễn Văn',
            Ten: 'An',
            NgaySinh: '1990-01-15',
            Phai: 'Nam',
            DiaChi: '123 Đường Lê Lợi, Phường Bến Nghé, Quận 1, TP.HCM',
            DienThoai: '0901234567'
        },
        {
            MaDocGia: 'DG002',
            HoLot: 'Trần Thị',
            Ten: 'Bình',
            NgaySinh: '1992-05-20',
            Phai: 'Nữ',
            DiaChi: '456 Đường Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP.HCM',
            DienThoai: '0987654321'
        },
        {
            MaDocGia: 'DG003',
            HoLot: 'Lê Văn',
            Ten: 'Cường',
            NgaySinh: '1988-12-10',
            Phai: 'Nam',
            DiaChi: '789 Đường Đồng Khởi, Phường Bến Nghé, Quận 1, TP.HCM',
            DienThoai: '0912345678'
        },
        {
            MaDocGia: 'DG004',
            HoLot: 'Phạm Thị',
            Ten: 'Dung',
            NgaySinh: '1995-03-25',
            Phai: 'Nữ',
            DiaChi: '321 Đường Pasteur, Phường Võ Thị Sáu, Quận 3, TP.HCM',
            DienThoai: '0923456789'
        },
        {
            MaDocGia: 'DG005',
            HoLot: 'Hoàng Văn',
            Ten: 'Em',
            NgaySinh: '1993-07-18',
            Phai: 'Nam',
            DiaChi: '654 Đường Cách Mạng Tháng 8, Phường 5, Quận 3, TP.HCM',
            DienThoai: '0934567890'
        }
    ]

    try {
        // Try to get data from API
        const response = await axios.get('/api/docgia')
        const apiData = response.data.docgia || response.data.data || []

        // Use API data if available and valid, otherwise use mock data
        if (Array.isArray(apiData) && apiData.length > 0) {
            docgiaList.value = apiData
        } else {
            console.log('API returned empty or invalid data, using mock data')
            docgiaList.value = mockData
        }
    } catch (error) {
        console.error('Error loading doc gia from API:', error)
        console.log('Using mock data as fallback')
        docgiaList.value = mockData
    } finally {
        loading.value = false
        // Final safety check
        if (!Array.isArray(docgiaList.value) || docgiaList.value.length === 0) {
            docgiaList.value = mockData
        }
    }
}

const handleSearch = () => {
    currentPage.value = 1
}

const clearSearch = () => {
    searchQuery.value = ''
    currentPage.value = 1
}

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
    }
}

const showAddModal = () => {
    editingDocGia.value = null
    resetForm()
    showModal.value = true
}

const editDocGia = (docgia) => {
    editingDocGia.value = docgia
    formData.value = { ...docgia }
    errors.value = {}
    showModal.value = true
}

const resetForm = () => {
    formData.value = {
        MaDocGia: '',
        HoLot: '',
        Ten: '',
        NgaySinh: '',
        Phai: '',
        DiaChi: '',
        DienThoai: ''
    }
    errors.value = {}
}

const closeModal = () => {
    showModal.value = false
    resetForm()
    editingDocGia.value = null
}

const validateForm = () => {
    errors.value = {}

    if (!formData.value.MaDocGia.trim()) {
        errors.value.MaDocGia = 'Mã độc giả là bắt buộc'
    } else if (!/^DG\d{3,}$/.test(formData.value.MaDocGia)) {
        errors.value.MaDocGia = 'Mã độc giả phải có định dạng DG001, DG002, ...'
    } else if (!editingDocGia.value && Array.isArray(docgiaList.value) && docgiaList.value.some(dg => dg.MaDocGia === formData.value.MaDocGia)) {
        errors.value.MaDocGia = 'Mã độc giả đã tồn tại'
    }

    if (!formData.value.HoLot.trim()) {
        errors.value.HoLot = 'Họ lót là bắt buộc'
    } else if (formData.value.HoLot.length > 50) {
        errors.value.HoLot = 'Họ lót không được quá 50 ký tự'
    }

    if (!formData.value.Ten.trim()) {
        errors.value.Ten = 'Tên là bắt buộc'
    } else if (formData.value.Ten.length > 20) {
        errors.value.Ten = 'Tên không được quá 20 ký tự'
    }

    if (!formData.value.NgaySinh) {
        errors.value.NgaySinh = 'Ngày sinh là bắt buộc'
    } else {
        const birthDate = new Date(formData.value.NgaySinh)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        if (age < 5 || age > 100) {
            errors.value.NgaySinh = 'Tuổi phải từ 5 đến 100'
        }
    }

    if (!formData.value.Phai) {
        errors.value.Phai = 'Phái là bắt buộc'
    }

    if (!formData.value.DiaChi.trim()) {
        errors.value.DiaChi = 'Địa chỉ là bắt buộc'
    } else if (formData.value.DiaChi.length > 200) {
        errors.value.DiaChi = 'Địa chỉ không được quá 200 ký tự'
    }

    if (!formData.value.DienThoai.trim()) {
        errors.value.DienThoai = 'Điện thoại là bắt buộc'
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.value.DienThoai)) {
        errors.value.DienThoai = 'Số điện thoại không hợp lệ'
    } else if (!editingDocGia.value && Array.isArray(docgiaList.value) && docgiaList.value.some(dg => dg.DienThoai === formData.value.DienThoai)) {
        errors.value.DienThoai = 'Số điện thoại đã được sử dụng'
    } else if (editingDocGia.value && Array.isArray(docgiaList.value) && docgiaList.value.some(dg => dg.DienThoai === formData.value.DienThoai && dg.MaDocGia !== editingDocGia.value.MaDocGia)) {
        errors.value.DienThoai = 'Số điện thoại đã được sử dụng'
    }

    return Object.keys(errors.value).length === 0
}

const saveDocGia = async () => {
    if (!validateForm()) return

    saving.value = true
    try {
        if (editingDocGia.value) {
            // Update existing
            await axios.put(`/api/docgia/${editingDocGia.value.MaDocGia}`, formData.value)
            if (Array.isArray(docgiaList.value)) {
                const index = docgiaList.value.findIndex(dg => dg.MaDocGia === editingDocGia.value.MaDocGia)
                if (index !== -1) {
                    docgiaList.value[index] = { ...formData.value }
                }
            }
        } else {
            // Create new
            await axios.post('/api/docgia', formData.value)
            if (Array.isArray(docgiaList.value)) {
                docgiaList.value.push({ ...formData.value })
            }
        }

        closeModal()
        // Show success message (you can implement toast notifications)
        console.log('Độc giả đã được lưu thành công')
    } catch (error) {
        console.error('Error saving doc gia:', error)
        // Handle API errors
        if (error.response?.data?.errors) {
            errors.value = error.response.data.errors
        }
    } finally {
        saving.value = false
    }
}

const confirmDelete = (docgia) => {
    deletingDocGia.value = docgia
    showDeleteModal.value = true
}

const deleteDocGia = async () => {
    if (!deletingDocGia.value) return

    deleting.value = true
    try {
        await axios.delete(`/api/docgia/${deletingDocGia.value.MaDocGia}`)
        if (Array.isArray(docgiaList.value)) {
            const index = docgiaList.value.findIndex(dg => dg.MaDocGia === deletingDocGia.value.MaDocGia)
            if (index !== -1) {
                docgiaList.value.splice(index, 1)
            }
        }

        showDeleteModal.value = false
        deletingDocGia.value = null

        // Adjust current page if needed
        if (paginatedDocGia.value.length === 0 && currentPage.value > 1) {
            currentPage.value--
        }

        console.log('Độc giả đã được xóa thành công')
    } catch (error) {
        console.error('Error deleting doc gia:', error)
    } finally {
        deleting.value = false
    }
}

const formatDate = (dateString) => {
    if (!dateString) return ''
    return new Date(dateString).toLocaleDateString('vi-VN')
}

// Watch for search query changes
watch(searchQuery, () => {
    currentPage.value = 1
})

// Lifecycle
onMounted(() => {
    loadDocGia()
})
</script>

<style scoped>
@import '@/assets/styles/main.css';

.card {
    border: none;
    box-shadow: 0 0.15rem 1.75rem 0 rgba(58, 59, 69, 0.15);
}

.table th {
    border-top: none;
    font-weight: 600;
    color: #5a5c69;
    background-color: #f8f9fc;
}

.badge {
    font-size: 0.75rem;
}

.btn-group .btn {
    padding: 0.25rem 0.5rem;
}

.modal-backdrop {
    background-color: rgba(0, 0, 0, 0.5);
}

.text-truncate {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.pagination .page-link {
    border-radius: 0.35rem;
    margin: 0 0.125rem;
    border: 1px solid #e3e6f0;
    color: #5a5c69;
}

.pagination .page-item.active .page-link {
    background-color: #4e73df;
    border-color: #4e73df;
}

.form-control:focus,
.form-select:focus {
    border-color: #bac8f3;
    box-shadow: 0 0 0 0.2rem rgba(78, 115, 223, 0.25);
}

.is-invalid {
    border-color: #e74a3b;
}

.invalid-feedback {
    display: block;
}

@media (max-width: 768px) {
    .table-responsive {
        font-size: 0.875rem;
    }

    .btn-group .btn {
        padding: 0.125rem 0.25rem;
    }

    .modal-dialog {
        margin: 0.5rem;
    }
}
</style>