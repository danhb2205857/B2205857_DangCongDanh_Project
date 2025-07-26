<template>
  <div class="admin-layout">
    <header class="navbar navbar-expand-lg navbar-dark bg-dark sticky-top">
      <div class="container-fluid">
        <a class="navbar-brand" href="#">📚 Quản trị Thư viện</a>
        <div class="d-flex align-items-center">
          <span class="text-white me-3">Xin chào, Admin</span>
          <router-link to="/logout" class="btn btn-outline-light btn-sm">Đăng xuất</router-link>
        </div>
      </div>
    </header>
    
    <div class="container-fluid">
      <div class="row">
        <nav class="col-md-2 d-none d-md-block sidebar py-4">
          <h4 class="text-center mb-4">Quản trị</h4>
          <ul class="nav flex-column">
            <li class="nav-item">
              <router-link class="nav-link" to="/admin">Thống kê</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/sach">Sách</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/nhaxuatban">Nhà xuất bản</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/users">Người dùng</router-link>
            </li>
            <li class="nav-item">
              <router-link class="nav-link" to="/admin/theodoimuonsach">Mượn/Trả</router-link>
            </li>
          </ul>
        </nav>
        <main class="col-md-10 ms-sm-auto px-md-4 py-4 main-content">
          <router-view />
        </main>
      </div>
    </div>
    
    <footer class="bg-light text-center py-3 mt-4 border-top">
      &copy; 2025 Nhóm CT467 - Library Management
    </footer>
  </div>
</template>

<script setup>
// Admin layout với thiết kế tương tự PHP, sử dụng màu vàng và sidebar
</script>

<style scoped>
.admin-layout {
  background: #fffbe6;
  min-height: 100vh;
}

.sidebar {
  background: #fffde7;
  min-height: 100vh;
  border-right: 2px solid #ffe082;
}

.btn-yellow {
  background: #ffe082;
  color: #333;
}

.btn-yellow:hover {
  background: #ffd54f;
}

.sidebar .nav-link {
  color: #333;
  border-radius: 4px;
  margin-bottom: 6px;
  transition: background 0.2s, color 0.2s;
}

.sidebar .nav-link.active,
.sidebar .nav-link:hover {
  background: #ffd54f;
  color: #212529;
  border-left: 4px solid #ffb300;
}

.main-content {
  min-height: 80vh;
}
</style>
