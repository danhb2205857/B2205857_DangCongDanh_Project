<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-6">
        <div class="card">
          <div class="card-header bg-success text-white">Đăng ký người dùng mới</div>
          <div class="card-body">
            <form @submit.prevent="register">
              <div class="row">
                <div class="col-md-6 mb-3">
                  <label class="form-label">Tên đăng nhập</label>
                  <input v-model="username" class="form-control" required />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Mật khẩu</label>
                  <input v-model="password" type="password" class="form-control" required />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Họ lót</label>
                  <input v-model="hoLot" class="form-control" required />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Tên</label>
                  <input v-model="ten" class="form-control" required />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Ngày sinh</label>
                  <input v-model="ngaySinh" type="date" class="form-control" required />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Giới tính</label>
                  <select v-model="phai" class="form-select" required>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                  </select>
                </div>
                <div class="col-md-6 mb-3">
                    <label class="form-label">Địa chỉ</label>
                  <input v-model="diaChi" class="form-control" required />
                </div>
                <div class="col-md-6 mb-3">
                  <label class="form-label">Điện thoại</label>
                  <input v-model="dienThoai" class="form-control" required />
                </div>
              </div>
              <button class="btn btn-success w-100" :disabled="loading">Đăng ký</button>
            </form>
            <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
            <div v-if="success" class="alert alert-success mt-3">{{ success }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const username = ref('');
const password = ref('');
const hoLot = ref('');
const ten = ref('');
const ngaySinh = ref('');
const phai = ref('Nam');
const diaChi = ref('');
const dienThoai = ref('');
const error = ref('');
const success = ref('');
const loading = ref(false);

async function register() {
  loading.value = true;
  error.value = '';
  success.value = '';
  try {
    await axios.post('/api/auth/register', {
      username: username.value,
      password: password.value,
      hoLot: hoLot.value,
      ten: ten.value,
      ngaySinh: ngaySinh.value,
      phai: phai.value,
      diaChi: diaChi.value,
      dienThoai: dienThoai.value
    });
    success.value = 'Đăng ký thành công!';
  } catch (err) {
    error.value = err.response?.data?.message || 'Đăng ký thất bại';
  } finally {
    loading.value = false;
  }
}
</script>
