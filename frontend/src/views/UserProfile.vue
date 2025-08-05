<template>
  <div class="user-profile">
    <div class="row">
      <!-- Sidebar Profile -->
      <div class="col-md-3">
        <div class="card border-0 shadow-sm">
          <div class="card-body text-center">
            <!-- Avatar -->
            <div class="mb-3">
              <div class="avatar-container position-relative d-inline-block">
                <img 
                  :src="user.avatar || '/images/avatar-default.svg'"
                  alt="Avatar"
                  class="rounded-circle border avatar-image"
                  @error="handleAvatarError"
                >
                <button 
                  class="btn btn-sm btn-primary position-absolute bottom-0 end-0 rounded-circle avatar-edit-btn"
                  @click="showAvatarModal = true"
                  title="Thay đổi ảnh đại diện"
                >
                  <i class="fas fa-camera"></i>
                </button>
              </div>
            </div>

            <!-- User Info -->
            <h5 class="card-title mb-1">{{ user.HoLot }} {{ user.Ten }}</h5>
            <p class="text-muted small mb-3">{{ user.MaDocGia }}</p>

            <div class="user-badges mb-3">
              <span class="badge bg-success">Độc giả</span>
              <span v-if="user.isVip" class="badge bg-warning">VIP</span>
            </div>

            <!-- Join Date -->
            <div class="text-muted small">
              <i class="fas fa-calendar-alt me-1"></i>
              Tham gia: {{ formatDate(user.createdAt) }}
            </div>
          </div>
        </div>

        <!-- Profile Menu -->
        <div class="card border-0 shadow-sm mt-3">
          <div class="card-body p-0">
            <div class="list-group list-group-flush">
              <button 
                class="list-group-item list-group-item-action"
                :class="{ active: activeTab === 'profile' }"
                @click="activeTab = 'profile'"
              >
                <i class="fas fa-user me-2"></i>Thông tin cá nhân
              </button>
              <button 
                class="list-group-item list-group-item-action"
                :class="{ active: activeTab === 'borrowHistory' }"
                @click="activeTab = 'borrowHistory'"
              >
                <i class="fas fa-history me-2"></i>Lịch sử mượn sách
              </button>
              <button 
                class="list-group-item list-group-item-action"
                :class="{ active: activeTab === 'currentBorrows' }"
                @click="activeTab = 'currentBorrows'"
              >
                <i class="fas fa-book me-2"></i>Sách đang mượn
              </button>
              <button 
                class="list-group-item list-group-item-action"
                :class="{ active: activeTab === 'settings' }"
                @click="activeTab = 'settings'"
              >
                <i class="fas fa-cog me-2"></i>Cài đặt
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="col-md-9">
        <!-- Success Message -->
        <div v-if="successMessage" class="alert alert-success alert-dismissible fade show" role="alert">
          <i class="fas fa-check-circle me-2"></i>{{ successMessage }}
          <button type="button" class="btn-close" @click="successMessage = ''" aria-label="Close"></button>
        </div>

        <!-- Stats Cards -->
        <div class="row mb-4">
          <div class="col-md-3 col-6 mb-3">
            <div class="card border-0 shadow-sm text-center stats-card">
              <div class="card-body">
                <div class="text-primary mb-2">
                  <i class="fas fa-book fa-2x"></i>
                </div>
                <h4 class="mb-1">{{ stats.totalBorrowed }}</h4>
                <small class="text-muted">Đã mượn</small>
              </div>
            </div>
          </div>

          <div class="col-md-3 col-6 mb-3">
            <div class="card border-0 shadow-sm text-center stats-card">
              <div class="card-body">
                <div class="text-warning mb-2">
                  <i class="fas fa-clock fa-2x"></i>
                </div>
                <h4 class="mb-1">{{ stats.currentBorrowing }}</h4>
                <small class="text-muted">Đang mượn</small>
              </div>
            </div>
          </div>

          <div class="col-md-3 col-6 mb-3">
            <div class="card border-0 shadow-sm text-center stats-card">
              <div class="card-body">
                <div class="text-danger mb-2">
                  <i class="fas fa-exclamation-triangle fa-2x"></i>
                </div>
                <h4 class="mb-1">{{ stats.overdue }}</h4>
                <small class="text-muted">Quá hạn</small>
              </div>
            </div>
          </div>

          <div class="col-md-3 col-6 mb-3">
            <div class="card border-0 shadow-sm text-center stats-card">
              <div class="card-body">
                <div class="text-success mb-2">
                  <i class="fas fa-check fa-2x"></i>
                </div>
                <h4 class="mb-1">{{ stats.returned }}</h4>
                <small class="text-muted">Đã trả</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="tab-content">
          <!-- Profile Tab -->
          <div v-if="activeTab === 'profile'" class="tab-pane">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0">
                <h5 class="mb-0">
                  <i class="fas fa-info-circle me-2"></i>Thông tin cá nhân
                </h5>
              </div>
              <div class="card-body">
                <form @submit.prevent="updateProfile">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Mã độc giả</label>
                        <input type="text" class="form-control" :value="user.MaDocGia" readonly>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Họ lót</label>
                        <input 
                          type="text" 
                          class="form-control" 
                          v-model="editForm.HoLot"
                          :readonly="!isEditing"
                        >
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Tên</label>
                        <input 
                          type="text" 
                          class="form-control" 
                          v-model="editForm.Ten"
                          :readonly="!isEditing"
                        >
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Ngày sinh</label>
                        <input 
                          type="date" 
                          class="form-control" 
                          v-model="editForm.NgaySinh"
                          :readonly="!isEditing"
                        >
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="mb-3">
                        <label class="form-label">Phái</label>
                        <select class="form-select" v-model="editForm.Phai" :disabled="!isEditing">
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                        </select>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Địa chỉ</label>
                        <textarea 
                          class="form-control" 
                          rows="3"
                          v-model="editForm.DiaChi"
                          :readonly="!isEditing"
                        ></textarea>
                      </div>
                      <div class="mb-3">
                        <label class="form-label">Số điện thoại</label>
                        <input 
                          type="tel" 
                          class="form-control" 
                          v-model="editForm.DienThoai"
                          :readonly="!isEditing"
                        >
                      </div>
                    </div>
                  </div>

                  <div class="d-flex gap-2">
                    <button 
                      v-if="!isEditing" 
                      type="button" 
                      class="btn btn-primary"
                      @click="startEditing"
                    >
                      <i class="fas fa-edit me-2"></i>Chỉnh sửa
                    </button>
                    <template v-else>
                      <button type="submit" class="btn btn-success">
                        <i class="fas fa-save me-2"></i>Lưu thay đổi
                      </button>
                      <button type="button" class="btn btn-secondary" @click="cancelEditing">
                        <i class="fas fa-times me-2"></i>Hủy
                      </button>
                    </template>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <!-- Borrow History Tab -->
          <div v-if="activeTab === 'borrowHistory'" class="tab-pane">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0">
                <h5 class="mb-0">
                  <i class="fas fa-history me-2"></i>Lịch sử mượn sách
                </h5>
              </div>
              <div class="card-body">
                <div v-if="borrowHistory.length > 0" class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>Mã theo dõi</th>
                        <th>Tên sách</th>
                        <th>Ngày mượn</th>
                        <th>Ngày hẹn trả</th>
                        <th>Ngày trả</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="record in borrowHistory" :key="record.MaTheoDoiMuonSach">
                        <td>{{ record.MaTheoDoiMuonSach }}</td>
                        <td>{{ record.MaSach?.TenSach || 'N/A' }}</td>
                        <td>{{ formatDate(record.NgayMuon) }}</td>
                        <td>{{ formatDate(record.NgayHenTra) }}</td>
                        <td>{{ record.NgayTra ? formatDate(record.NgayTra) : '-' }}</td>
                        <td>
                          <span class="badge" :class="getStatusBadgeClass(record.TrangThai)">
                            {{ record.TrangThai }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div v-else class="text-center py-4">
                  <i class="fas fa-history fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">Chưa có lịch sử mượn sách</h5>
                </div>
              </div>
            </div>
          </div>

          <!-- Current Borrows Tab -->
          <div v-if="activeTab === 'currentBorrows'" class="tab-pane">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0">
                <h5 class="mb-0">
                  <i class="fas fa-book me-2"></i>Sách đang mượn
                </h5>
              </div>
              <div class="card-body">
                <div v-if="currentBorrows.length > 0" class="row g-4">
                  <div v-for="record in currentBorrows" :key="record.MaTheoDoiMuonSach" class="col-md-6">
                    <div class="card border-0 shadow-sm">
                      <div class="card-body">
                        <h6 class="card-title">{{ record.MaSach?.TenSach || 'N/A' }}</h6>
                        <p class="card-text text-muted small">
                          Mã theo dõi: {{ record.MaTheoDoiMuonSach }}
                        </p>
                        <div class="row text-center">
                          <div class="col-6">
                            <small class="text-muted">Ngày mượn</small>
                            <div>{{ formatDate(record.NgayMuon) }}</div>
                          </div>
                          <div class="col-6">
                            <small class="text-muted">Hạn trả</small>
                            <div :class="{ 'text-danger': isOverdue(record.NgayHenTra) }">
                              {{ formatDate(record.NgayHenTra) }}
                            </div>
                          </div>
                        </div>
                        <div class="mt-3">
                          <span class="badge" :class="getStatusBadgeClass(record.TrangThai)">
                            {{ record.TrangThai }}
                          </span>
                          <span v-if="isOverdue(record.NgayHenTra)" class="badge bg-danger ms-2">
                            Quá hạn {{ getDaysOverdue(record.NgayHenTra) }} ngày
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-else class="text-center py-4">
                  <i class="fas fa-book fa-3x text-muted mb-3"></i>
                  <h5 class="text-muted">Không có sách đang mượn</h5>
                </div>
              </div>
            </div>
          </div>

          <!-- Settings Tab -->
          <div v-if="activeTab === 'settings'" class="tab-pane">
            <div class="card border-0 shadow-sm">
              <div class="card-header bg-white border-0">
                <h5 class="mb-0">
                  <i class="fas fa-cog me-2"></i>Cài đặt tài khoản
                </h5>
              </div>
              <div class="card-body">
                <div class="row">
                  <div class="col-md-6">
                    <h6>Thông báo</h6>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.emailNotifications" id="emailNotif">
                      <label class="form-check-label" for="emailNotif">
                        Nhận thông báo qua email
                      </label>
                    </div>
                    <div class="form-check">
                      <input class="form-check-input" type="checkbox" v-model="settings.smsNotifications" id="smsNotif">
                      <label class="form-check-label" for="smsNotif">
                        Nhận thông báo qua SMS
                      </label>
                    </div>
                  </div>
                  <div class="col-md-6">
                    <h6>Bảo mật</h6>
                    <button class="btn btn-outline-warning mb-2 w-100">
                      <i class="fas fa-key me-2"></i>Đổi mật khẩu
                    </button>
                    <button class="btn btn-outline-danger w-100">
                      <i class="fas fa-trash me-2"></i>Xóa tài khoản
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Avatar Modal -->
    <div v-if="showAvatarModal" class="modal fade show d-block" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Thay đổi ảnh đại diện</h5>
            <button type="button" class="btn-close" @click="showAvatarModal = false"></button>
          </div>
          <div class="modal-body">
            <input type="file" ref="avatarInput" @change="handleAvatarChange" accept="image/*" class="form-control">
            <div v-if="avatarPreview" class="text-center mt-3">
              <img :src="avatarPreview" alt="Preview" class="img-thumbnail" style="max-width: 200px;">
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showAvatarModal = false">Hủy</button>
            <button type="button" class="btn btn-primary" @click="uploadAvatar" :disabled="!avatarPreview">
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-if="showAvatarModal" class="modal-backdrop fade show"></div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import axios from '@/utils/axios'

export default {
  name: 'UserProfile',
  setup() {
    const { user: authUser } = useAuth()
    
    const user = ref({})
    const activeTab = ref('profile')
    const isEditing = ref(false)
    const successMessage = ref('')
    const showAvatarModal = ref(false)
    const avatarPreview = ref('')
    const avatarInput = ref(null)
    
    const editForm = ref({
      HoLot: '',
      Ten: '',
      NgaySinh: '',
      Phai: '',
      DiaChi: '',
      DienThoai: ''
    })

    const stats = ref({
      totalBorrowed: 0,
      currentBorrowing: 0,
      overdue: 0,
      returned: 0
    })

    const borrowHistory = ref([])
    const currentBorrows = ref([])
    
    const settings = ref({
      emailNotifications: true,
      smsNotifications: false
    })

    const loadUserProfile = async () => {
      try {
        // In a real app, this would come from the auth user or API
        user.value = authUser.value || {
          MaDocGia: 'DG001',
          HoLot: 'Nguyễn Văn',
          Ten: 'An',
          NgaySinh: '1990-01-01',
          Phai: 'Nam',
          DiaChi: '123 Đường ABC, Quận 1, TP.HCM',
          DienThoai: '0123456789',
          createdAt: '2024-01-01',
          avatar: null
        }
        
        // Copy to edit form
        Object.keys(editForm.value).forEach(key => {
          editForm.value[key] = user.value[key] || ''
        })
      } catch (error) {
        console.error('Error loading user profile:', error)
      }
    }

    const loadBorrowHistory = async () => {
      try {
        const response = await axios.get(`/api/theodoimuonsach/docgia/${user.value.MaDocGia}`)
        borrowHistory.value = response.data.data || []
        
        // Filter current borrows
        currentBorrows.value = borrowHistory.value.filter(record => 
          record.TrangThai === 'Đang mượn' || record.TrangThai === 'Quá hạn'
        )
        
        // Update stats
        stats.value = {
          totalBorrowed: borrowHistory.value.length,
          currentBorrowing: currentBorrows.value.length,
          overdue: borrowHistory.value.filter(r => r.TrangThai === 'Quá hạn').length,
          returned: borrowHistory.value.filter(r => r.TrangThai === 'Đã trả').length
        }
      } catch (error) {
        console.error('Error loading borrow history:', error)
      }
    }

    const startEditing = () => {
      isEditing.value = true
    }

    const cancelEditing = () => {
      isEditing.value = false
      // Reset form
      Object.keys(editForm.value).forEach(key => {
        editForm.value[key] = user.value[key] || ''
      })
    }

    const updateProfile = async () => {
      try {
        const response = await axios.put(`/api/docgia/${user.value.MaDocGia}`, editForm.value)
        user.value = { ...user.value, ...editForm.value }
        isEditing.value = false
        successMessage.value = 'Cập nhật thông tin thành công!'
        
        setTimeout(() => {
          successMessage.value = ''
        }, 3000)
      } catch (error) {
        console.error('Error updating profile:', error)
        alert('Có lỗi xảy ra khi cập nhật thông tin!')
      }
    }

    const handleAvatarChange = (event) => {
      const file = event.target.files[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          avatarPreview.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }

    const uploadAvatar = async () => {
      try {
        const formData = new FormData()
        formData.append('avatar', avatarInput.value.files[0])
        
        // In a real app, upload to server
        // const response = await axios.post('/api/upload/avatar', formData)
        
        user.value.avatar = avatarPreview.value
        showAvatarModal.value = false
        avatarPreview.value = ''
        successMessage.value = 'Cập nhật ảnh đại diện thành công!'
        
        setTimeout(() => {
          successMessage.value = ''
        }, 3000)
      } catch (error) {
        console.error('Error uploading avatar:', error)
        alert('Có lỗi xảy ra khi tải ảnh lên!')
      }
    }

    const formatDate = (dateString) => {
      if (!dateString) return ''
      return new Date(dateString).toLocaleDateString('vi-VN')
    }

    const getStatusBadgeClass = (status) => {
      switch (status) {
        case 'Đang mượn': return 'bg-primary'
        case 'Đã trả': return 'bg-success'
        case 'Quá hạn': return 'bg-danger'
        default: return 'bg-secondary'
      }
    }

    const isOverdue = (dueDate) => {
      return new Date(dueDate) < new Date()
    }

    const getDaysOverdue = (dueDate) => {
      const today = new Date()
      const due = new Date(dueDate)
      const diffTime = today - due
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    }

    const handleAvatarError = (event) => {
      // Fallback to default avatar
      event.target.src = '/images/avatar-default.svg'
    }

    onMounted(() => {
      loadUserProfile()
      loadBorrowHistory()
    })

    return {
      user,
      activeTab,
      isEditing,
      successMessage,
      showAvatarModal,
      avatarPreview,
      avatarInput,
      editForm,
      stats,
      borrowHistory,
      currentBorrows,
      settings,
      startEditing,
      cancelEditing,
      updateProfile,
      handleAvatarChange,
      uploadAvatar,
      formatDate,
      getStatusBadgeClass,
      isOverdue,
      getDaysOverdue,
      handleAvatarError
    }
  }
}
</script>

<style scoped>
.avatar-image {
  width: 120px;
  height: 120px;
  object-fit: cover;
}

.avatar-edit-btn {
  width: 32px;
  height: 32px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stats-card {
  transition: transform 0.2s ease-in-out;
}

.stats-card:hover {
  transform: translateY(-2px);
}

.list-group-item-action {
  border: none;
  text-align: left;
}

.list-group-item-action.active {
  background-color: #007bff;
  color: white;
}

.modal.show {
  background-color: rgba(0, 0, 0, 0.5);
}
</style>