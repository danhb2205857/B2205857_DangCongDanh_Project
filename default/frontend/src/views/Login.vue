<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-4">
        <div class="card">
          <div class="card-header bg-primary text-white">Đăng nhập</div>
          <div class="card-body">
            <form @submit.prevent="login">
              <div class="mb-3">
                <label class="form-label">Tên đăng nhập</label>
                <input v-model="username" class="form-control" required />
              </div>
              <div class="mb-3">
                <label class="form-label">Mật khẩu</label>
                <input v-model="password" type="password" class="form-control" required />
              </div>
              <button class="btn btn-primary w-100" :disabled="loading">Đăng nhập</button>
            </form>
            <div v-if="error" class="alert alert-danger mt-3">{{ error }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const username = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);
const router = useRouter();

async function login() {
  loading.value = true;
  error.value = '';
  try {
    const res = await axios.post('/api/auth/login', { username: username.value, password: password.value });
    localStorage.setItem('token', res.data.token);
    if (res.data.role === 'admin') {
      router.push('/admin');
    } else {
      router.push('/');
    }
  } catch (err) {
    error.value = err.response?.data?.message || 'Đăng nhập thất bại';
  } finally {
    loading.value = false;
  }
}
</script>
