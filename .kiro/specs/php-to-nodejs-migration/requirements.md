# Requirements Document

## Introduction

Chuyển đổi dự án quản lý từ PHP sang Node.js/Express/MongoDB với frontend Bootstrap 5 + Vue.js 3. Dự án sẽ tập trung vào quản lý mượn sách thay vì quản lý truyện như hiện tại. Hệ thống sẽ sử dụng cấu trúc và phong cách code đã được thiết lập trong thư mục `default/`.

## Requirements

### Requirement 1: Backend Migration

**User Story:** Là một developer, tôi muốn chuyển đổi backend từ PHP sang Node.js/Express/MongoDB để có hiệu suất tốt hơn và dễ bảo trì hơn.

#### Acceptance Criteria

1. WHEN khởi tạo dự án THEN hệ thống SHALL sử dụng Node.js với Express framework
2. WHEN kết nối database THEN hệ thống SHALL sử dụng MongoDB với Mongoose ODM
3. WHEN tổ chức code THEN hệ thống SHALL tuân theo cấu trúc MVC như trong `default/backend/src/`
4. WHEN xử lý API THEN hệ thống SHALL sử dụng RESTful API pattern
5. WHEN xử lý authentication THEN hệ thống SHALL sử dụng JWT tokens

### Requirement 2: Database Schema Migration

**User Story:** Là một developer, tôi muốn chuyển đổi database schema từ MySQL sang MongoDB để phù hợp với hệ thống quản lý mượn sách.

#### Acceptance Criteria

1. WHEN tạo model DocGia THEN hệ thống SHALL có các field: MaDocGia, HoLot, Ten, NgaySinh, Phai, DiaChi, DienThoai
2. WHEN tạo model Sach THEN hệ thống SHALL có các field: MaSach, TenSach, DonGia, SoQuyen, NamXuatBan, MaNXB, NguonGoc/TacGia
3. WHEN tạo model NhaXuatBan THEN hệ thống SHALL có các field: MaNXB, TenNXB, DiaChi
4. WHEN tạo model TheoDoiMuonSach THEN hệ thống SHALL có các field: MaDocGia, MaSach, NgayMuon, NgayTra
5. WHEN tạo model NhanVien THEN hệ thống SHALL có các field: MSNV, HoTenNV, Password, ChucVu, DiaChi, SoDienThoai

### Requirement 3: API Endpoints

**User Story:** Là một frontend developer, tôi muốn có các API endpoints để quản lý dữ liệu mượn sách.

#### Acceptance Criteria

1. WHEN gọi API THEN hệ thống SHALL cung cấp CRUD operations cho DocGia tại `/api/docgia`
2. WHEN gọi API THEN hệ thống SHALL cung cấp CRUD operations cho Sach tại `/api/sach`
3. WHEN gọi API THEN hệ thống SHALL cung cấp CRUD operations cho NhaXuatBan tại `/api/nhaxuatban`
4. WHEN gọi API THEN hệ thống SHALL cung cấp CRUD operations cho TheoDoiMuonSach tại `/api/theodoimuonsach`
5. WHEN gọi API THEN hệ thống SHALL cung cấp authentication endpoints tại `/api/auth`
6. WHEN gọi API với pagination THEN hệ thống SHALL hỗ trợ query parameters: page, limit, search

### Requirement 4: Frontend Migration

**User Story:** Là một user, tôi muốn có giao diện web hiện đại để quản lý mượn sách.

#### Acceptance Criteria

1. WHEN truy cập ứng dụng THEN hệ thống SHALL sử dụng Vue.js 3 với Composition API
2. WHEN hiển thị giao diện THEN hệ thống SHALL sử dụng Bootstrap 5 cho styling
3. WHEN điều hướng THEN hệ thống SHALL sử dụng Vue Router 4
4. WHEN gọi API THEN hệ thống SHALL sử dụng Axios cho HTTP requests
5. WHEN build project THEN hệ thống SHALL sử dụng Vite làm build tool

### Requirement 5: Core Features

**User Story:** Là một thủ thư, tôi muốn quản lý việc mượn trả sách của độc giả.

#### Acceptance Criteria

1. WHEN quản lý độc giả THEN hệ thống SHALL cho phép thêm, sửa, xóa, tìm kiếm độc giả
2. WHEN quản lý sách THEN hệ thống SHALL cho phép thêm, sửa, xóa, tìm kiếm sách
3. WHEN quản lý nhà xuất bản THEN hệ thống SHALL cho phép thêm, sửa, xóa nhà xuất bản
4. WHEN theo dõi mượn sách THEN hệ thống SHALL ghi nhận ngày mượn và ngày trả
5. WHEN xem thống kê THEN hệ thống SHALL hiển thị dashboard với các số liệu tổng quan

### Requirement 6: Authentication & Authorization

**User Story:** Là một admin, tôi muốn có hệ thống đăng nhập để bảo mật dữ liệu.

#### Acceptance Criteria

1. WHEN đăng nhập THEN hệ thống SHALL xác thực thông tin nhân viên
2. WHEN đăng nhập thành công THEN hệ thống SHALL tạo JWT token
3. WHEN truy cập protected routes THEN hệ thống SHALL kiểm tra JWT token
4. WHEN token hết hạn THEN hệ thống SHALL redirect về trang login
5. WHEN đăng xuất THEN hệ thống SHALL xóa token khỏi client

### Requirement 7: Project Structure

**User Story:** Là một developer, tôi muốn dự án có cấu trúc rõ ràng và dễ maintain.

#### Acceptance Criteria

1. WHEN tổ chức backend THEN hệ thống SHALL tuân theo cấu trúc: controllers/, models/, routes/, middlewares/
2. WHEN tổ chức frontend THEN hệ thống SHALL tuân theo cấu trúc: views/, components/, router/, layouts/
3. WHEN cấu hình THEN hệ thống SHALL sử dụng environment variables cho config
4. WHEN development THEN hệ thống SHALL có hot reload cho cả backend và frontend
5. WHEN deployment THEN hệ thống SHALL có Docker configuration