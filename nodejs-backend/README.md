# Hệ thống Quản lý Mượn Sách - Backend

Backend API được chuyển đổi từ PHP sang Node.js/Express/MongoDB cho hệ thống quản lý mượn sách thư viện.

## Tính năng chính

- Quản lý độc giả (DocGia)
- Quản lý sách (Sach)
- Quản lý nhà xuất bản (NhaXuatBan)
- Theo dõi mượn trả sách (TheoDoiMuonSach)
- Xác thực nhân viên (NhanVien)
- RESTful API với pagination và search

## Cấu trúc thư mục

```
src/
├── controllers/    # Controllers xử lý business logic
├── models/        # Mongoose models cho MongoDB
├── routes/        # API routes definition
├── middlewares/   # Custom middlewares
├── config.js      # Cấu hình ứng dụng
└── index.js       # Entry point
```

## Cài đặt và chạy

### Yêu cầu hệ thống

- Node.js >= 16.0.0
- MongoDB (chạy qua Docker)
- npm hoặc yarn

### Cài đặt

1. Cài đặt dependencies:

   ```bash
   npm install
   ```

2. Khởi động MongoDB bằng Docker:

   ```bash
   docker-compose up -d
   ```

3. Chạy server development:

   ```bash
   npm run dev
   ```

4. Server sẽ chạy tại: http://localhost:3000

## API Endpoints

### Authentication

- `POST /api/auth/login` - Đăng nhập nhân viên
- `POST /api/auth/logout` - Đăng xuất
- `GET /api/auth/profile` - Thông tin profile

### Quản lý Độc giả

- `GET /api/docgia` - Danh sách độc giả (có pagination & search)
- `GET /api/docgia/:id` - Chi tiết độc giả
- `POST /api/docgia` - Thêm độc giả mới
- `PUT /api/docgia/:id` - Cập nhật độc giả
- `DELETE /api/docgia/:id` - Xóa độc giả

### Quản lý Sách

- `GET /api/sach` - Danh sách sách (có pagination & search)
- `GET /api/sach/:id` - Chi tiết sách
- `POST /api/sach` - Thêm sách mới
- `PUT /api/sach/:id` - Cập nhật sách
- `DELETE /api/sach/:id` - Xóa sách

### Quản lý Nhà xuất bản

- `GET /api/nhaxuatban` - Danh sách nhà xuất bản
- `GET /api/nhaxuatban/:id` - Chi tiết nhà xuất bản
- `POST /api/nhaxuatban` - Thêm nhà xuất bản
- `PUT /api/nhaxuatban/:id` - Cập nhật nhà xuất bản
- `DELETE /api/nhaxuatban/:id` - Xóa nhà xuất bản

### Theo dõi Mượn sách

- `GET /api/theodoimuonsach` - Danh sách mượn sách
- `POST /api/theodoimuonsach` - Tạo phiếu mượn
- `PUT /api/theodoimuonsach/:id` - Trả sách
- `DELETE /api/theodoimuonsach/:id` - Xóa phiếu mượn

## Environment Variables

```
PORT=3000                                    # Cổng server
MONGODB_URI=mongodb://admin:admin@localhost:27017/quanlymuonsach  # MongoDB connection
JWT_SECRET=your_jwt_secret                   # JWT secret key
JWT_EXPIRES_IN=24h                          # JWT expiration time
UPLOAD_DIR=public/uploads                    # Upload directory
```

## Database Schema

Hệ thống sử dụng MongoDB với các collections:

- `docgias` - Thông tin độc giả
- `sachs` - Thông tin sách
- `nhaxuatbans` - Thông tin nhà xuất bản
- `theodoimuonsachs` - Theo dõi mượn trả sách
- `nhanviens` - Thông tin nhân viên

## Development

- Sử dụng nodemon để auto-restart khi code thay đổi
- ESLint và Prettier để format code
- Mongoose ODM cho MongoDB operations
- JWT cho authentication
- bcrypt cho password hashing

## MongoDB Management

### Sử dụng Docker Compose
```bash
# Khởi động MongoDB
docker-compose up -d mongodb

# Khởi động MongoDB Admin interface
docker-compose up -d mongo-express

# Dừng tất cả services
docker-compose down

# Xem logs
docker-compose logs -f mongodb
```

### Sử dụng Scripts tiện ích
```bash
# Linux/Mac
./scripts/mongodb.sh start    # Khởi động MongoDB
./scripts/mongodb.sh admin    # Khởi động Admin interface
./scripts/mongodb.sh stop     # Dừng MongoDB
./scripts/mongodb.sh status   # Kiểm tra trạng thái

# Windows
scripts\mongodb.bat start     # Khởi động MongoDB
scripts\mongodb.bat admin     # Khởi động Admin interface
scripts\mongodb.bat stop      # Dừng MongoDB
scripts\mongodb.bat status    # Kiểm tra trạng thái
```

### MongoDB Admin Interface
- URL: http://localhost:8081
- Username: admin
- Password: admin

### Sample Data
Database được khởi tạo với dữ liệu mẫu:
- 2 độc giả (DG001, DG002)
- 2 nhà xuất bản (NXB001, NXB002)  
- 1 tài khoản admin (MSNV: NV001, Password: admin123)