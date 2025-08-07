<template>
  <div class="profile-page">
    <div class="container py-4">
      <div class="row">
        <!-- Sidebar -->
        <div class="col-md-3 mb-4">
          <div class="card">
            <div class="card-body text-center">
              <div class="avatar-container mb-3">
                <img 
                  :src="user?.avatar || '/images/avatar-default.svg'" 
                  alt="Avatar" 
                  class="avatar"
                  @error="handleAvatarError"
                >
                <button 
                  class="btn btn-sm btn-primary avatar-edit-btn"
                  @click="showAvatarModal = true"
                >
                  <i class="fas fa-camera"></i>
                </button>
              </div>
              <h5 class="mb-1">{{ user?.HoLot }} {{ user?.Ten }}</h5>
              <p class="text-muted mb-2">{{ user?.MaDocGia }}</p>
              <span class="badge bg-success">Hoạt động</span>

            </div>
          </div>

          <!-- Navigation -->
          <div class="card mt-3">
            <div class="list-group list-group-flush">
              <button 
                class="list-group-item list-group-item-action"
                :class="{ active: activeTab === 'profile' }"
                @click="activeTab = 'profile'"
              >
                <i class="fas fa-user me-2"></i>
                Thông tin cá nhân
              </button>
              <button 
                class="list-group-item list-group-item-action"
                :class="{ active: activeTab === 'password' }"
                @click="activeTab = 'password'"
              >
                <i class="fas fa-lock me-2"></i>
                Đổi mật khẩu
              </button>
              <button 
                class="list-group-item list-group-item-action"
                :class="{ active: activeTab === 'borrows' }"
                @click="activeTab = 'borrows'"
              >
                <i class="fas fa-book me-2"></i>
                Sách đang mượn
              </button>
              <button 
                class="list-group-item list-group-item-action"
                :class="{ active: activeTab === 'history' }"
                @click="activeTab = 'history'"
              >
                <i class="fas fa-history me-2"></i>
                Lịch sử mượn
              </button>
            </div>
          </div>
        </div>

        <!-- Main Content -->
        <div class="col-md-9">
          <!-- Profile Tab -->
          <div v-if="activeTab === 'profile'" class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-user me-2"></i>
                Thông tin cá nhân
              </h5>
            </div>
            <div class="card-body">
              <dl class="row">
                <div v-for="item in profileUser" :key="item.key" class="row">
                  <dt class="col-sm-4">{{ item.label }}</dt>
                  <dd class="col-sm-8">
                    <span v-if="item.key !== 'avatar'">{{ item.value || '-' }}</span>
                    <img 
                      v-else 
                      :src="item.value || '/images/avatar-default.svg'" 
                      alt="Avatar" 
                      style="width:60px;height:60px;border-radius:50%;object-fit:cover;"
                      @error="handleAvatarError"
                    >
                  </dd>
                </div>
              </dl>
              <div class="d-flex justify-content-end">
                <button class="btn btn-primary" @click="showEditProfileModal = true">
                  <i class="fas fa-edit me-2"></i> Cập nhật thông tin
                </button>
              </div>
            </div>
          </div>

          <!-- Edit Profile Modal -->
          <div class="modal fade" id="editProfileModal" tabindex="-1" v-if="showEditProfileModal">
            <div class="modal-dialog">
              <div class="modal-content">
                <div class="modal-header">
                  <h5 class="modal-title">Cập nhật thông tin cá nhân</h5>
                  <button type="button" class="btn-close" @click="showEditProfileModal = false"></button>
                </div>
                <div class="modal-body">
                  <form @submit.prevent="submitEditProfile">
                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label for="hoLotEdit" class="form-label">Họ lót</label>
                        <input type="text" class="form-control" id="hoLotEdit" v-model="profileForm.HoLot" required maxlength="50">
                      </div>
                      <div class="col-md-6 mb-3">
                        <label for="tenEdit" class="form-label">Tên</label>
                        <input type="text" class="form-control" id="tenEdit" v-model="profileForm.Ten" required maxlength="20">
                      </div>
                    </div>
                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label for="ngaySinhEdit" class="form-label">Ngày sinh</label>
                        <input type="date" class="form-control" id="ngaySinhEdit" v-model="profileForm.NgaySinh" required>
                      </div>
                      <div class="col-md-6 mb-3">
                        <label for="phaiEdit" class="form-label">Phái</label>
                        <select class="form-select" id="phaiEdit" v-model="profileForm.Phai" required>
                          <option value="">Chọn phái</option>
                          <option value="Nam">Nam</option>
                          <option value="Nữ">Nữ</option>
                        </select>
                      </div>
                    </div>
                    <div class="mb-3">
                      <label for="diaChiEdit" class="form-label">Địa chỉ</label>
                      <textarea class="form-control" id="diaChiEdit" rows="3" v-model="profileForm.DiaChi" required maxlength="200"></textarea>
                    </div>
                    <div class="row">
                      <div class="col-md-6 mb-3">
                        <label for="dienThoaiEdit" class="form-label">Điện thoại</label>
                        <input type="tel" class="form-control" id="dienThoaiEdit" v-model="profileForm.DienThoai" required pattern="^(0|\+84)[0-9]{9,10}$">
                      </div>
                      <div class="col-md-6 mb-3">
                        <label for="emailEdit" class="form-label">Email</label>
                        <input type="email" class="form-control" id="emailEdit" :value="user?.email" disabled readonly>
                        <div class="form-text">Email không thể thay đổi</div>
                      </div>
                    </div>
                    <div class="mb-3">
                      <label for="avatarEdit" class="form-label">Avatar URL</label>
                      <input type="url" class="form-control" id="avatarEdit" v-model="profileForm.avatar" placeholder="https://example.com/avatar.jpg">
                    </div>
                    <div class="d-flex justify-content-end">
                      <button type="button" class="btn btn-secondary me-2" @click="showEditProfileModal = false">Hủy</button>
                      <button type="submit" class="btn btn-primary" :disabled="loading">
                        <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                        Lưu thay đổi
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </div>

          <!-- Password Tab -->
          <div v-if="activeTab === 'password'" class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-lock me-2"></i>
                Đổi mật khẩu
              </h5>
            </div>
            <div class="card-body">
              <form @submit.prevent="changePassword">
                <div class="mb-3">
                  <label for="currentPassword" class="form-label">Mật khẩu hiện tại</label>
                  <input
                    type="password"
                    class="form-control"
                    id="currentPassword"
                    v-model="passwordForm.currentPassword"
                    required
                  >
                </div>
                <div class="mb-3">
                  <label for="newPassword" class="form-label">Mật khẩu mới</label>
                  <input
                    type="password"
                    class="form-control"
                    id="newPassword"
                    v-model="passwordForm.newPassword"
                    required
                    minlength="6"
                  >
                  <div class="form-text">Mật khẩu phải có ít nhất 6 ký tự</div>
                </div>
                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Xác nhận mật khẩu mới</label>
                  <input
                    type="password"
                    class="form-control"
                    id="confirmPassword"
                    v-model="passwordForm.confirmPassword"
                    required
                    :class="{ 'is-invalid': passwordForm.newPassword && passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword }"
                  >
                  <div class="invalid-feedback">
                    Mật khẩu xác nhận không khớp
                  </div>
                </div>
                <div class="d-flex justify-content-end">
                  <button type="button" class="btn btn-secondary me-2" @click="resetPasswordForm">
                    Hủy
                  </button>
                  <button 
                    type="submit" 
                    class="btn btn-primary" 
                    :disabled="loading || passwordForm.newPassword !== passwordForm.confirmPassword"
                  >
                    <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                    Đổi mật khẩu
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Borrows Tab -->
          <div v-if="activeTab === 'borrows'" class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-book me-2"></i>
                Sách đang mượn
              </h5>
            </div>
            <div class="card-body">
              <div v-if="borrowedBooks.length === 0" class="text-center py-4">
                <i class="fas fa-book-open fa-3x text-muted mb-3"></i>
                <p class="text-muted">Bạn chưa mượn sách nào</p>
              </div>
              <div v-else>
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>Tên sách</th>
                        <th>Ngày mượn</th>
                        <th>Hạn trả</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="borrow in borrowedBooks" :key="borrow._id">
                        <td>{{ borrow.MaSach?.TenSach || '-' }}</td>
                        <td>{{ formatDate(borrow.NgayMuon) }}</td>
                        <td>{{ formatDate(borrow.NgayHenTra) }}</td>
                        <td>
                          <span 
                            class="badge"
                            :class="isOverdue(borrow.NgayHenTra) ? 'bg-danger' : 'bg-warning'"
                          >
                            {{ isOverdue(borrow.NgayHenTra) ? 'Quá hạn' : 'Đang mượn' }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <!-- History Tab -->
          <div v-if="activeTab === 'history'" class="card">
            <div class="card-header">
              <h5 class="mb-0">
                <i class="fas fa-history me-2"></i>
                Lịch sử mượn sách
              </h5>
            </div>
            <div class="card-body">
              <div v-if="borrowHistory.length === 0" class="text-center py-4">
                <i class="fas fa-history fa-3x text-muted mb-3"></i>
                <p class="text-muted">Chưa có lịch sử mượn sách</p>
              </div>
              <div v-else>
                <div class="table-responsive">
                  <table class="table table-hover">
                    <thead>
                      <tr>
                        <th>Tên sách</th>
                        <th>Ngày mượn</th>
                        <th>Ngày trả</th>
                        <th>Trạng thái</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="history in borrowHistory" :key="history._id">
                        <td>{{ history.MaSach?.TenSach || '-' }}</td>
                        <td>{{ formatDate(history.NgayMuon) }}</td>
                        <td>{{ history.NgayTra ? formatDate(history.NgayTra) : '-' }}</td>
                        <td>
                          <span 
                            class="badge"
                            :class="history.NgayTra ? 'bg-success' : 'bg-warning'"
                          >
                            {{ history.NgayTra ? 'Đã trả' : 'Đang mượn' }}
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Avatar Modal -->
    <div class="modal fade" id="avatarModal" tabindex="-1" v-if="showAvatarModal">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Cập nhật Avatar</h5>
            <button type="button" class="btn-close" @click="showAvatarModal = false"></button>
          </div>
          <div class="modal-body">
            <div class="mb-3">
              <label for="avatarUrl" class="form-label">URL Avatar</label>
              <input
                type="url"
                class="form-control"
                id="avatarUrl"
                v-model="avatarUrl"
                placeholder="https://example.com/avatar.jpg"
              >
            </div>
            <div class="text-center">
              <img 
                :src="avatarUrl || '/images/avatar-default.svg'" 
                alt="Preview" 
                class="avatar-preview"
                @error="handleAvatarError"
              >
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="showAvatarModal = false">
              Hủy
            </button>
            <button type="button" class="btn btn-primary" @click="updateAvatar">
              Cập nhật
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Success/Error Messages -->
    <div v-if="message" class="alert-container">
      <div class="alert alert-dismissible fade show"
        :class="messageType === 'success' ? 'alert-success' : 'alert-danger'" role="alert">
        <i :class="messageType === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'" class="me-2"></i>
        {{ message }}
        <button type="button" class="btn-close" @click="clearMessage"></button>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, computed } from 'vue'
import { useAuth } from '@/composables/useAuth'
import axios from '@/utils/axios'

export default {
  name: 'Profile',
  setup() {
    const { user, token, logout, updateProfile: updateUserProfile, changePassword: changeUserPassword } = useAuth()
    
    const activeTab = ref('profile')
    const loading = ref(false)
    const message = ref('')
    const messageType = ref('success')
    const showAvatarModal = ref(false)
    const showEditProfileModal = ref(false)
    const avatarUrl = ref('')
    const borrowedBooks = ref([])
    const borrowHistory = ref([])

    // Profile form
    const profileForm = reactive({
      HoLot: '',
      Ten: '',
      NgaySinh: '',
      Phai: '',
      DiaChi: '',
      DienThoai: '',
      avatar: ''
    })

    // Password form
    const passwordForm = reactive({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })

    // Get profile
    const getProfile = async () => {
      try {
        if (!token.value) {
          return { success: false, error: 'Không có token' }
        }
        const response = await axios.get('/docgia/profile')
        user.value = response.data.data
        localStorage.setItem('user', JSON.stringify(response.data.data))
        return { success: true, user: response.data.data }
      } catch (error) {
        if (error.response?.status === 401) {
          await logout()
        }
        return {
          success: false,
          error: error.response?.data?.message || 'Không thể lấy thông tin profile'
        }
      }
    }

    // Profile user array for display
    const profileUser = computed(() => {
      if (user.value?._doc) {
        return [
          { key: 'HoLot', label: 'Họ lót', value: user.value._doc.HoLot || '-' },
          { key: 'Ten', label: 'Tên', value: user.value._doc.Ten || '-' },
          { key: 'NgaySinh', label: 'Ngày sinh', value: user.value._doc.NgaySinh ? formatDate(user.value._doc.NgaySinh) : '-' },
          { key: 'Phai', label: 'Phái', value: user.value._doc.Phai || '-' },
          { key: 'DiaChi', label: 'Địa chỉ', value: user.value._doc.DiaChi || '-' },
          { key: 'DienThoai', label: 'Điện thoại', value: user.value._doc.DienThoai || '-' },
          { key: 'email', label: 'Email', value: user.value._doc.email || '-' },
          { key: 'avatar', label: 'Avatar', value: user.value._doc.avatar || '' }
        ]
      }
      return []
    })

    // Initialize form with user data
    const initializeForm = () => {
      if (user.value?._doc) {
        profileForm.HoLot = user.value._doc.HoLot || ''
        profileForm.Ten = user.value._doc.Ten || ''
        profileForm.NgaySinh = user.value._doc.NgaySinh ? new Date(user.value._doc.NgaySinh).toISOString().split('T')[0] : ''
        profileForm.Phai = user.value._doc.Phai || ''
        profileForm.DiaChi = user.value._doc.DiaChi || ''
        profileForm.DienThoai = user.value._doc.DienThoai || ''
        profileForm.avatar = user.value._doc.avatar || ''
        avatarUrl.value = user.value._doc.avatar || ''
      }
    }

    // Submit edit profile
    const submitEditProfile = async () => {
      loading.value = true
      try {
        const result = await updateUserProfile(profileForm)
        if (result.success) {
          showMessage('Cập nhật thông tin thành công!', 'success')
          showEditProfileModal.value = false
          await getProfile()
          initializeForm()
        } else {
          showMessage(result.error, 'error')
        }
      } catch (error) {
        showMessage('Có lỗi xảy ra khi cập nhật thông tin!', 'error')
      } finally {
        loading.value = false
      }
    }

    // Change password
    const changePassword = async () => {
      if (passwordForm.newPassword !== passwordForm.confirmPassword) {
        showMessage('Mật khẩu xác nhận không khớp!', 'error')
        return
      }

      loading.value = true
      try {
        const result = await changeUserPassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
        
        if (result.success) {
          showMessage('Đổi mật khẩu thành công!', 'success')
          resetPasswordForm()
        } else {
          showMessage(result.error, 'error')
        }
      } catch (error) {
        showMessage('Có lỗi xảy ra khi đổi mật khẩu!', 'error')
      } finally {
        loading.value = false
      }
    }

    // Update avatar
    const updateAvatar = async () => {
      profileForm.avatar = avatarUrl.value
      loading.value = true
      try {
        const result = await updateUserProfile({ avatar: avatarUrl.value })
        if (result.success) {
          showMessage('Cập nhật avatar thành công!', 'success')
          showAvatarModal.value = false
          await getProfile()
          initializeForm()
        } else {
          showMessage(result.error, 'error')
        }
      } catch (error) {
        showMessage('Có lỗi xảy ra khi cập nhật avatar!', 'error')
      } finally {
        loading.value = false
      }
    }

    // Load borrowed books
    const loadBorrowedBooks = async () => {
      try {
        if (!user.value?._doc.MaDocGia) return
        const response = await axios.get(`/theodoimuonsach/docgia/${user.value._doc.MaDocGia}`)
        const allBorrows = response.data.data || []
        borrowedBooks.value = allBorrows.filter(b => !b.NgayTra)
      } catch (error) {
        showMessage('Có lỗi khi tải danh sách sách đang mượn!', 'error')
      }
    }

    // Load borrow history
    const loadBorrowHistory = async () => {
      try {
        if (!user.value?._doc.MaDocGia) return
        const response = await axios.get(`/theodoimuonsach/docgia/${user.value._doc.MaDocGia}`)
        borrowHistory.value = response.data.data || []
      } catch (error) {
        showMessage('Có lỗi khi tải lịch sử mượn sách!', 'error')
      }
    }

    // Reset forms
    const resetPasswordForm = () => {
      passwordForm.currentPassword = ''
      passwordForm.newPassword = ''
      passwordForm.confirmPassword = ''
    }

    // Utility functions
    const formatDate = (dateString) => {
      if (!dateString) return '-'
      return new Date(dateString).toLocaleDateString('vi-VN')
    }

    const isOverdue = (dateString) => {
      if (!dateString) return false
      return new Date(dateString) < new Date()
    }

    const handleAvatarError = (event) => {
      event.target.src = '/images/avatar-default.svg'
    }

    const showMessage = (msg, type = 'success') => {
      message.value = msg
      messageType.value = type
      setTimeout(() => {
        clearMessage()
      }, 5000)
    }

    const clearMessage = () => {
      message.value = ''
      messageType.value = 'success'
    }

    // Load data on mount
    onMounted(async () => {
      const result = await getProfile()
      if (result.success) {
        initializeForm()
        loadBorrowedBooks()
        loadBorrowHistory()
      } else {
        showMessage(result.error, 'error')
      }
    })

    return {
      user,
      activeTab,
      loading,
      message,
      messageType,
      showAvatarModal,
      showEditProfileModal,
      avatarUrl,
      borrowedBooks,
      borrowHistory,
      profileForm,
      passwordForm,
      profileUser,
      submitEditProfile,
      changePassword,
      updateAvatar,
      resetPasswordForm,
      formatDate,
      isOverdue,
      handleAvatarError,
      clearMessage
    }
  }
}
</script>

<style scoped>
.profile-page {
  min-height: 100vh;
  background-color: #f8f9fa;
  padding-top: 80px;
}

.avatar-container {
  position: relative;
  display: inline-block;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #fff;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.avatar-edit-btn {
  position: absolute;
  bottom: 0;
  right: 0;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #dee2e6;
}

.list-group-item.active {
  background-color: #0d6efd;
  border-color: #0d6efd;
}

.alert-container {
  position: fixed;
  top: 100px;
  right: 20px;
  z-index: 1050;
  min-width: 300px;
  max-width: 500px;
}

.card {
  border: none;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
  background-color: #fff;
  border-bottom: 1px solid #dee2e6;
}

.table th {
  border-top: none;
  font-weight: 600;
  color: #495057;
}

@media (max-width: 768px) {
  .alert-container {
    right: 10px;
    left: 10px;
    min-width: auto;
  }
  
  .avatar {
    width: 100px;
    height: 100px;
  }
}
</style>