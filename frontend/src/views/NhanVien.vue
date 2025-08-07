<template>
    <div class="container-fluid">
        <div class="row">
            <div class="col-12">
                <div class="card shadow">
                    <div class="card-header py-3">
                        <h5 class="card-title mb-0 text-primary font-weight-bold">
                            <i class="bi bi-person-badge me-2"></i>Quản lý nhân viên
                        </h5>
                    </div>
                    <div class="card-body">
                        <!-- Permission Info -->
                        <div class="alert mb-4" :class="isManager ? 'alert-success' : 'alert-warning'" role="alert">
                            <i class="bi me-2" :class="isManager ? 'bi-check-circle' : 'bi-exclamation-triangle'"></i>
                            <strong>Quyền hạn:</strong> 
                            <span v-if="isManager">Bạn có quyền quản lý nhân viên.</span>
                            <span v-else>Bạn chỉ có thể xem danh sách nhân viên. Chỉ <strong>Quản lý thư viện</strong> mới được phép thao tác.</span>
                            <br>
                            Tài khoản hiện tại: <strong>{{ currentUser?.HoTenNV || currentUser?.hoTenNV }}</strong> - <strong>{{ currentUser?.ChucVu || currentUser?.chucVu }}</strong>
                        </div>

                        <!-- Search and Add Section -->
                        <div class="row mb-4">
                            <div class="col-md-8">
                                <div class="input-group">
                                    <span class="input-group-text">
                                        <i class="bi bi-search"></i>
                                    </span>
                                    <input type="text" class="form-control"
                                        placeholder="Tìm kiếm theo mã, họ tên, chức vụ, địa chỉ, điện thoại..."
                                        v-model="searchQuery" @input="handleSearch">
                                    <button class="btn btn-outline-secondary" @click="clearSearch" v-if="searchQuery">
                                        <i class="bi bi-x"></i>
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-4 text-end">
                                <button class="btn btn-primary" @click="showAddModal" :disabled="!isManager">
                                    <i class="bi bi-plus-circle me-2"></i>Thêm nhân viên
                                </button>
                            </div>
                        </div>

                        <!-- Table Section -->
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead class="table-light">
                                    <tr>
                                        <th style="width: 100px;">Mã NV</th>
                                        <th style="width: 180px;">Họ tên</th>
                                        <th style="width: 120px;">Chức vụ</th>
                                        <th style="width: 120px;">Điện thoại</th>
                                        <th>Địa chỉ</th>
                                        <th style="width: 100px;" class="text-center">Trạng thái</th>
                                        <th style="width: 140px;" class="text-center">Thao tác</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr v-for="nhanvien in nhanvienList" :key="nhanvien.MSNV">
                                        <td>
                                            <span class="badge bg-primary">{{ nhanvien.MSNV }}</span>
                                        </td>
                                        <td class="fw-bold">{{ nhanvien.HoTenNV }}</td>
                                        <td>
                                            <span class="badge bg-info">{{ nhanvien.ChucVu }}</span>
                                        </td>
                                        <td>{{ nhanvien.SoDienThoai }}</td>
                                        <td class="text-truncate" style="max-width: 200px;" :title="nhanvien.DiaChi">
                                            {{ nhanvien.DiaChi }}
                                        </td>
                                        <td class="text-center">
                                            <span class="badge" 
                                                :class="nhanvien.isActivate === 1 ? 'bg-success' : 'bg-danger'">
                                                {{ nhanvien.isActivate === 1 ? 'Kích hoạt' : 'Vô hiệu hóa' }}
                                            </span>
                                        </td>
                                        <td class="text-center">
                                            <div class="btn-group" role="group" v-if="isManager">
                                                <button class="btn btn-sm btn-outline-primary"
                                                    @click="editNhanVien(nhanvien)" title="Chỉnh sửa">
                                                    <i class="bi bi-pencil"></i>
                                                </button>
                                                <button class="btn btn-sm"
                                                    :class="nhanvien.isActivate === 1 ? 'btn-outline-warning' : 'btn-outline-success'"
                                                    @click="toggleActivate(nhanvien)"
                                                    :title="nhanvien.isActivate === 1 ? 'Vô hiệu hóa' : 'Kích hoạt'">
                                                    <i :class="nhanvien.isActivate === 1 ? 'bi bi-toggle-on' : 'bi bi-toggle-off'"></i>
                                                </button>
                                                <button class="btn btn-sm btn-outline-danger"
                                                    @click="confirmDelete(nhanvien)" title="Xóa">
                                                    <i class="bi bi-trash"></i>
                                                </button>
                                            </div>
                                            <div v-else class="text-muted">
                                                <small>Không có quyền</small>
                                            </div>
                                        </td>
                                    </tr>
                                    <tr v-if="nhanvienList.length === 0 && !loading">
                                        <td colspan="7" class="text-center text-muted py-4">
                                            <i class="bi bi-inbox display-4 d-block mb-2"></i>
                                            {{ searchQuery ? 'Không tìm thấy nhân viên nào' : 'Chưa có nhân viên nào' }}
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
                            <p class="mt-2 text-muted">Đang tải danh sách nhân viên...</p>
                        </div>

                        <!-- Pagination -->
                        <div class="row mt-4" v-if="totalItems > 0">
                            <div class="col-md-6">
                                <p class="text-muted">
                                    Hiển thị {{ startIndex + 1 }} - {{ endIndex }} trong tổng số {{ totalItems }} nhân viên
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
                            <i class="bi bi-person-plus me-2" v-if="!editingNhanVien"></i>
                            <i class="bi bi-person-gear me-2" v-else></i>
                            {{ editingNhanVien ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới' }}
                        </h5>
                        <button type="button" class="btn-close" @click="closeModal"></button>
                    </div>
                    <div class="modal-body">
                        <form @submit.prevent="saveNhanVien">
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="msnv" class="form-label">Mã số nhân viên <span
                                                class="text-danger">*</span></label>
                                        <input type="text" class="form-control" id="msnv"
                                            v-model="formData.MSNV" :disabled="editingNhanVien"
                                            :class="{ 'is-invalid': errors.MSNV }" placeholder="VD: NV001">
                                        <div class="invalid-feedback" v-if="errors.MSNV">{{ errors.MSNV }}</div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="chucVu" class="form-label">Chức vụ <span
                                                class="text-danger">*</span></label>
                                        <select class="form-select" id="chucVu" v-model="formData.ChucVu"
                                            :class="{ 'is-invalid': errors.ChucVu }">
                                            <option value="">Chọn chức vụ</option>
                                            <option value="Quản lý thư viện">Quản lý thư viện</option>
                                            <option value="Thủ thư">Thủ thư</option>
                                            <option value="Nhân viên">Nhân viên</option>
                                            <option value="Thực tập sinh">Thực tập sinh</option>
                                        </select>
                                        <div class="invalid-feedback" v-if="errors.ChucVu">{{ errors.ChucVu }}</div>
                                    </div>
                                </div>
                            </div>

                            <div class="mb-3">
                                <label for="hoTenNV" class="form-label">Họ tên nhân viên <span
                                        class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="hoTenNV" v-model="formData.HoTenNV"
                                    :class="{ 'is-invalid': errors.HoTenNV }" placeholder="VD: Nguyễn Văn An">
                                <div class="invalid-feedback" v-if="errors.HoTenNV">{{ errors.HoTenNV }}</div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="soDienThoai" class="form-label">Số điện thoại <span
                                                class="text-danger">*</span></label>
                                        <input type="tel" class="form-control" id="soDienThoai"
                                            v-model="formData.SoDienThoai" :class="{ 'is-invalid': errors.SoDienThoai }"
                                            placeholder="VD: 0901234567">
                                        <div class="invalid-feedback" v-if="errors.SoDienThoai">{{ errors.SoDienThoai }}</div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="email" class="form-label">Email</label>
                                        <input type="email" class="form-control" id="email"
                                            v-model="formData.Email" :class="{ 'is-invalid': errors.Email }"
                                            placeholder="VD: nhanvien@email.com">
                                        <div class="invalid-feedback" v-if="errors.Email">{{ errors.Email }}</div>
                                    </div>
                                </div>
                            </div>

                            <div class="row">
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="ngaySinh" class="form-label">Ngày sinh</label>
                                        <input type="date" class="form-control" id="ngaySinh"
                                            v-model="formData.NgaySinh" :class="{ 'is-invalid': errors.NgaySinh }"
                                            :max="maxDate">
                                        <div class="invalid-feedback" v-if="errors.NgaySinh">{{ errors.NgaySinh }}</div>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="mb-3">
                                        <label for="ngayVaoLam" class="form-label">Ngày vào làm</label>
                                        <input type="date" class="form-control" id="ngayVaoLam"
                                            v-model="formData.NgayVaoLam" :class="{ 'is-invalid': errors.NgayVaoLam }"
                                            :max="todayDate">
                                        <div class="invalid-feedback" v-if="errors.NgayVaoLam">{{ errors.NgayVaoLam }}</div>
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

                            <div class="mb-3" v-if="!editingNhanVien">
                                <label for="password" class="form-label">Mật khẩu <span
                                        class="text-danger">*</span></label>
                                <input type="password" class="form-control" id="password"
                                    v-model="formData.Password" :class="{ 'is-invalid': errors.Password }"
                                    placeholder="Nhập mật khẩu">
                                <div class="invalid-feedback" v-if="errors.Password">{{ errors.Password }}</div>
                            </div>
                        </form>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="closeModal">
                            <i class="bi bi-x-circle me-2"></i>Hủy
                        </button>
                        <button type="button" class="btn btn-primary" @click="saveNhanVien" :disabled="saving">
                            <span v-if="saving" class="spinner-border spinner-border-sm me-2"></span>
                            <i class="bi bi-check-circle me-2" v-else></i>
                            {{ editingNhanVien ? 'Cập nhật' : 'Thêm mới' }}
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
                        <p>Bạn có chắc chắn muốn xóa nhân viên <strong>{{ deletingNhanVien?.HoTenNV }}</strong>?</p>
                        <p class="text-muted small">Hành động này không thể hoàn tác.</p>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" @click="showDeleteModal = false">
                            <i class="bi bi-x-circle me-2"></i>Hủy
                        </button>
                        <button type="button" class="btn btn-danger" @click="deleteNhanVien" :disabled="deleting">
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
import { useRouter } from 'vue-router'
import api from '../utils/axios.js'

const router = useRouter()

// Current user info
const currentUser = ref(null)

// Reactive data
const nhanvienList = ref([])
const loading = ref(false)
const saving = ref(false)
const deleting = ref(false)
const searchQuery = ref('')
const currentPage = ref(1)
const itemsPerPage = ref(10)
const totalItems = ref(0)
const totalPages = ref(0)

// Modal states
const showModal = ref(false)
const showDeleteModal = ref(false)
const editingNhanVien = ref(null)
const deletingNhanVien = ref(null)

// Form data
const formData = ref({
    MSNV: '',
    HoTenNV: '',
    Password: '',
    ChucVu: '',
    DiaChi: '',
    SoDienThoai: '',
    Email: '',
    NgaySinh: '',
    NgayVaoLam: ''
})

// Form errors
const errors = ref({})

// Computed properties
const startIndex = computed(() => (currentPage.value - 1) * itemsPerPage.value)
const endIndex = computed(() => {
    return Math.min(startIndex.value + itemsPerPage.value, totalItems.value)
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
    const maxDate = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    return maxDate.toISOString().split('T')[0]
})

const todayDate = computed(() => {
    return new Date().toISOString().split('T')[0]
})

// Check if current user is manager
const isManager = computed(() => {
    const chucVu = currentUser.value?.ChucVu || currentUser.value?.chucVu
    console.log('isManager check:', {
        currentUser: currentUser.value,
        ChucVu: currentUser.value?.ChucVu,
        chucVu: currentUser.value?.chucVu,
        finalChucVu: chucVu,
        isManager: chucVu === 'Quản lý thư viện'
    })
    return chucVu === 'Quản lý thư viện'
})

// Methods
const loadNhanVien = async () => {
    loading.value = true

    try {
        const params = {
            page: currentPage.value,
            limit: itemsPerPage.value,
            search: searchQuery.value
        }
        
        const response = await api.get('/nhanvien', { params })
        const data = response.data.data
        
        if (data) {
            nhanvienList.value = data.nhanviens || []
            totalItems.value = data.pagination?.total || 0
            totalPages.value = data.pagination?.totalPages || 0
        } else {
            nhanvienList.value = []
            totalItems.value = 0
            totalPages.value = 0
        }
    } catch (error) {
        console.error('Error loading nhan vien from API:', error)
        nhanvienList.value = []
        totalItems.value = 0
        totalPages.value = 0
    } finally {
        loading.value = false
    }
}

const handleSearch = () => {
    currentPage.value = 1
    loadNhanVien()
}

const clearSearch = () => {
    searchQuery.value = ''
    currentPage.value = 1
    loadNhanVien()
}

const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page
        loadNhanVien()
    }
}

const showAddModal = () => {
    if (!isManager.value) {
        alert('Chỉ Quản lý thư viện mới có quyền thêm nhân viên!')
        return
    }
    editingNhanVien.value = null
    resetForm()
    showModal.value = true
}

const editNhanVien = (nhanvien) => {
    if (!isManager.value) {
        alert('Chỉ Quản lý thư viện mới có quyền chỉnh sửa nhân viên!')
        return
    }
    editingNhanVien.value = nhanvien
    formData.value = { 
        ...nhanvien,
        NgaySinh: nhanvien.NgaySinh ? new Date(nhanvien.NgaySinh).toISOString().split('T')[0] : '',
        NgayVaoLam: nhanvien.NgayVaoLam ? new Date(nhanvien.NgayVaoLam).toISOString().split('T')[0] : ''
    }
    errors.value = {}
    showModal.value = true
}

const resetForm = () => {
    formData.value = {
        MSNV: '',
        HoTenNV: '',
        Password: '',
        ChucVu: '',
        DiaChi: '',
        SoDienThoai: '',
        Email: '',
        NgaySinh: '',
        NgayVaoLam: ''
    }
    errors.value = {}
}

const closeModal = () => {
    showModal.value = false
    resetForm()
    editingNhanVien.value = null
}

const validateForm = () => {
    errors.value = {}

    if (!formData.value.MSNV.trim()) {
        errors.value.MSNV = 'Mã số nhân viên là bắt buộc'
    } else if (!/^NV\d{3,}$/.test(formData.value.MSNV)) {
        errors.value.MSNV = 'Mã nhân viên phải có định dạng NV001, NV002, ...'
    }

    if (!formData.value.HoTenNV.trim()) {
        errors.value.HoTenNV = 'Họ tên nhân viên là bắt buộc'
    } else if (formData.value.HoTenNV.length > 100) {
        errors.value.HoTenNV = 'Họ tên không được quá 100 ký tự'
    }

    if (!editingNhanVien.value && !formData.value.Password.trim()) {
        errors.value.Password = 'Mật khẩu là bắt buộc'
    } else if (formData.value.Password && formData.value.Password.length < 6) {
        errors.value.Password = 'Mật khẩu phải có ít nhất 6 ký tự'
    }

    if (!formData.value.ChucVu) {
        errors.value.ChucVu = 'Chức vụ là bắt buộc'
    }

    if (!formData.value.DiaChi.trim()) {
        errors.value.DiaChi = 'Địa chỉ là bắt buộc'
    } else if (formData.value.DiaChi.length > 200) {
        errors.value.DiaChi = 'Địa chỉ không được quá 200 ký tự'
    }

    if (!formData.value.SoDienThoai.trim()) {
        errors.value.SoDienThoai = 'Số điện thoại là bắt buộc'
    } else if (!/^(0|\+84)[0-9]{9,10}$/.test(formData.value.SoDienThoai)) {
        errors.value.SoDienThoai = 'Số điện thoại không hợp lệ'
    }

    if (formData.value.Email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.value.Email)) {
        errors.value.Email = 'Email không hợp lệ'
    }

    if (formData.value.NgaySinh) {
        const birthDate = new Date(formData.value.NgaySinh)
        const today = new Date()
        const age = today.getFullYear() - birthDate.getFullYear()
        if (age < 18 || age > 65) {
            errors.value.NgaySinh = 'Tuổi nhân viên phải từ 18 đến 65'
        }
    }

    if (formData.value.NgayVaoLam) {
        const workDate = new Date(formData.value.NgayVaoLam)
        if (workDate > new Date()) {
            errors.value.NgayVaoLam = 'Ngày vào làm không được là ngày tương lai'
        }
    }

    return Object.keys(errors.value).length === 0
}

const saveNhanVien = async () => {
    if (!isManager.value) {
        alert('Chỉ Quản lý thư viện mới có quyền lưu thông tin nhân viên!')
        return
    }
    
    if (!validateForm()) return

    saving.value = true
    try {
        if (editingNhanVien.value) {
            // Update existing - don't send password
            const updateData = { ...formData.value }
            delete updateData.Password
            await api.put(`/nhanvien/${editingNhanVien.value._id}`, updateData)
        } else {
            // Create new
            await api.post('/nhanvien', formData.value)
        }

        closeModal()
        loadNhanVien()
        console.log('Nhân viên đã được lưu thành công')
    } catch (error) {
        console.error('Error saving nhan vien:', error)
        if (error.response?.data?.errors) {
            errors.value = error.response.data.errors
        }
    } finally {
        saving.value = false
    }
}

const toggleActivate = async (nhanvien) => {
    if (!isManager.value) {
        alert('Chỉ Quản lý thư viện mới có quyền kích hoạt/vô hiệu hóa nhân viên!')
        return
    }
    
    try {
        await api.patch(`/nhanvien/${nhanvien._id}/activate`)
        loadNhanVien()
        console.log(`${nhanvien.isActivate === 1 ? 'Vô hiệu hóa' : 'Kích hoạt'} nhân viên thành công`)
    } catch (error) {
        console.error('Error toggling activate:', error)
    }
}

const confirmDelete = (nhanvien) => {
    if (!isManager.value) {
        alert('Chỉ Quản lý thư viện mới có quyền xóa nhân viên!')
        return
    }
    deletingNhanVien.value = nhanvien
    showDeleteModal.value = true
}

const deleteNhanVien = async () => {
    if (!deletingNhanVien.value) return

    deleting.value = true
    try {
        await api.delete(`/nhanvien/${deletingNhanVien.value._id}`)

        showDeleteModal.value = false
        deletingNhanVien.value = null
        loadNhanVien()

        console.log('Nhân viên đã được xóa thành công')
    } catch (error) {
        console.error('Error deleting nhan vien:', error)
    } finally {
        deleting.value = false
    }
}

// Initialize user info
const initializeUser = () => {
    const userStr = localStorage.getItem('user')
    const userRole = localStorage.getItem('userRole')
    
    console.log('Raw user from localStorage:', userStr)
    console.log('User role from localStorage:', userRole)
    
    if (!userStr) {
        alert('Không tìm thấy thông tin đăng nhập. Vui lòng đăng nhập lại.')
        router.push('/login')
        return false
    }
    
    try {
        const user = JSON.parse(userStr)
        console.log('Parsed user:', user)
        
        // Set current user info
        currentUser.value = user
        
        // Check if user is staff
        if (userRole !== 'staff') {
            alert('Bạn không có quyền truy cập trang này.')
            router.push('/admin')
            return false
        }
        
        return true
    } catch (error) {
        console.error('Error parsing user data:', error)
        alert('Dữ liệu đăng nhập không hợp lệ. Vui lòng đăng nhập lại.')
        router.push('/login')
        return false
    }
}

// Watch for search query changes with debounce
let searchTimeout
watch(searchQuery, () => {
    clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        currentPage.value = 1
        loadNhanVien()
    }, 500)
})

// Lifecycle
onMounted(() => {
    if (initializeUser()) {
        loadNhanVien()
    }
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