# Hệ thống Quản lý Mượn Sách

Dự án chuyển đổi từ PHP sang Node.js/Express/MongoDB cho hệ thống quản lý mượn sách thư viện.

## 📁 Cấu trúc dự án

```
├── nodejs-backend/          # Backend API (Node.js + Express + MongoDB)
├── default/                 # Template code reference
├── scripts/                 # Utility scripts
├── mongodb-init/           # Database initialization
├── .kiro/                  # Kiro IDE specs
└── docker-compose.yml      # MongoDB container
```

## 🚀 Khởi chạy dự án

### 1. Khởi động MongoDB
```bash
docker-compose up -d mongodb
```

### 2. Chạy Backend API
```bash
cd nodejs-backend
npm install
npm run dev
```

Backend sẽ chạy tại: http://localhost:3000

## 📊 Tính năng chính

- ✅ **Quản lý độc giả** - CRUD operations với search và pagination
- ✅ **Quản lý sách** - Quản lý kho sách với nhà xuất bản
- ✅ **Quản lý nhà xuất bản** - Thông tin các nhà xuất bản
- ✅ **Mượn/trả sách** - Workflow hoàn chỉnh với business logic
- ✅ **Quản lý nhân viên** - Authentication và authorization
- ✅ **Dashboard** - Thống kê và báo cáo

## 🔧 Công nghệ sử dụng

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose ODM
- JWT Authentication
- bcrypt Password Hashing

**Database:**
- MongoDB (Docker container)
- Sample data initialization

**Development:**
- Kiro IDE Specs
- Docker for MongoDB
- Git version control

## 📝 API Endpoints

### Authentication
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/profile` - Thông tin profile
- `PUT /api/auth/change-password` - Đổi mật khẩu

### Dashboard
- `GET /api/dashboard/stats` - Thống kê tổng quan
- `GET /api/dashboard/recent-activities` - Hoạt động gần đây
- `GET /api/dashboard/charts` - Dữ liệu biểu đồ

### Quản lý
- `GET /api/docgia` - Danh sách độc giả
- `GET /api/sach` - Danh sách sách
- `GET /api/nhaxuatban` - Danh sách nhà xuất bản
- `GET /api/theodoimuonsach` - Danh sách mượn sách
- `GET /api/nhanvien` - Danh sách nhân viên

## 🔐 Authentication

**Admin Account:**
- MSNV: `NV001`
- Password: `admin123`
- Permissions: Full access

## 📚 Documentation

Chi tiết về API và cách sử dụng xem trong:
- `nodejs-backend/README.md` - Backend documentation
- `.kiro/specs/` - Development specs

## 🤝 Đóng góp

Dự án được phát triển với Kiro IDE và tuân theo spec-driven development.

## 📄 License

ISC License