# Hướng dẫn Authentication với MongoDB

## 🔐 Cấu hình hoàn tất

Authentication system đã được cấu hình để sử dụng tài khoản từ MongoDB collection `NhanVien`.

## 📋 Tài khoản từ Database

Hệ thống sẽ sử dụng tài khoản từ collection `NhanVien` với các field:
- `MSNV`: Mã số nhân viên (username)
- `Password`: Mật khẩu (đã hash)
- `HoTenNV`: Họ tên nhân viên
- `ChucVu`: Chức vụ
- `DiaChi`: Địa chỉ
- `SoDienThoai`: Số điện thoại

## 🚀 API Endpoints đã sẵn sàng

- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/profile` - Lấy thông tin profile
- `POST /api/auth/refresh` - Refresh token

## ⚡ Cách sử dụng

1. **Khởi động backend:**
   ```bash
   cd nodejs-backend
   npm run dev
   ```

2. **Khởi động frontend:**
   ```bash
   cd vue-frontend
   npm run dev
   ```

3. **Đăng nhập:**
   - Truy cập: http://localhost:5174/login
   - Sử dụng MSNV và Password từ database

## 🔧 Đã loại bỏ

- ❌ Trang AuthTest
- ❌ Mock authentication
- ❌ Test buttons
- ❌ Fake JWT tokens

## ✅ Sẵn sàng production

Authentication system đã sẵn sàng sử dụng với MongoDB thực tế!