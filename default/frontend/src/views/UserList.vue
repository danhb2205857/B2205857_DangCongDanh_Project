<template>
  <AdminLayout>
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="text-white">Danh sách người dùng</h2>
      <router-link to="/register" class="btn btn-success">Thêm người dùng mới</router-link>
    </div>
    <div class="card">
      <div class="card-body">
        <div class="mb-3">
          <input v-model="search" @input="fetchUsers" class="form-control" placeholder="Tìm kiếm tên, mã, địa chỉ...">
        </div>
        <table class="table table-hover">
          <thead>
            <tr>
              <th>Mã</th>
              <th>Họ tên</th>
              <th>Ngày sinh</th>
              <th>Phụ lục</th>
              <th>Địa chỉ</th>
              <th>Điện thoại</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user._id">
              <td>{{ user.MaDocGia }}</td>
              <td>{{ user.HoLot }} {{ user.Ten }}</td>
              <td>{{ user.NgaySinh ? new Date(user.NgaySinh).toLocaleDateString() : '' }}</td>
              <td>{{ user.Phai }}</td>
              <td>{{ user.DiaChi }}</td>
              <td>{{ user.DienThoai }}</td>
            </tr>
          </tbody>
        </table>
        <nav>
          <ul class="pagination justify-content-center">
            <li class="page-item" :class="{ disabled: page === 1 }">
              <button class="page-link" @click="changePage(page - 1)">&laquo;</button>
            </li>
            <li class="page-item" v-for="p in totalPages" :key="p" :class="{ active: p === page }">
              <button class="page-link" @click="changePage(p)">{{ p }}</button>
            </li>
            <li class="page-item" :class="{ disabled: page === totalPages }">
              <button class="page-link" @click="changePage(page + 1)">&raquo;</button>
            </li>
          </ul>
        </nav>
      </div>
    </div>
  </AdminLayout>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import AdminLayout from '../layouts/AdminLayout.vue';

const users = ref([]);
const page = ref(1);
const totalPages = ref(1);
const search = ref('');
const limit = 10;

async function fetchUsers() {
  const res = await axios.get(`/api/docgia`, {
    params: { page: page.value, limit, search: search.value }
  });
  users.value = res.data.data;
  totalPages.value = res.data.totalPages;
}

function changePage(p) {
  if (p < 1 || p > totalPages.value) return;
  page.value = p;
  fetchUsers();
}

onMounted(fetchUsers);
</script>
