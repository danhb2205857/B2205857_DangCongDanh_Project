# Implementation Plan

- [x] 1. Thiết lập cấu trúc dự án cơ bản

  - Copy cấu trúc backend từ `default/backend/` làm foundation
  - Cập nhật package.json với thông tin dự án mới
  - Cấu hình environment variables cho quản lý mượn sách
  - _Requirements: 7.1, 7.3_

- [ ] 2. Thiết lập MongoDB và Docker

  - Tạo docker-compose.yml chỉ cho MongoDB

  - Cấu hình MongoDB connection string
  - Test kết nối database từ Node.js
  - _Requirements: 1.2, 2.1_

- [x] 3. Tạo Mongoose models cho hệ thống mượn sách

  - Implement DocGia model với validation
  - Implement Sach model với validation
  - Implement NhaXuatBan model với validation
  - Implement TheoDoiMuonSach model với relationships
  - Implement NhanVien model cho authentication
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 4. Implement authentication system

  - Tạo JWT authentication middleware
  - Implement login/logout endpoints

  - Implement password hashing với bcrypt
  - Test authentication flow
  - _Requirements: 1.5, 6.1, 6.2, 6.3_

- [ ] 5. Tạo controllers cho CRUD operations

  - Implement DocGiaController với pagination và search
  - Implement SachController với pagination và search
  - Implement NhaXuatBanController với pagination và search
  - Implement TheoDoiMuonSachController với business logic
  - Test tất cả CRUD operations
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.6_

- [x] 6. Thiết lập API routes

  - Tạo routes cho authentication endpoints
  - Tạo routes cho DocGia management
  - Tạo routes cho Sach management
  - Tạo routes cho NhaXuatBan management
  - Tạo routes cho TheoDoiMuonSach management
  - Test tất cả API endpoints
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 7. Thiết lập frontend Vue.js cơ bản

  - Tạo cấu trúc frontend mới với Vite + Vue 3
  - Cấu hình package.json với dependencies cần thiết
  - Thiết lập Vite config với proxy cho API calls
  - Copy và adapt CSS styles từ dự án PHP hiện tại
  - Test hot reload và build process
  - _Requirements: 4.1, 4.3, 4.5_

- [x] 8. Implement authentication UI

  - Tạo Login.vue component
  - Implement JWT token storage
  - Tạo authentication guards cho routes
  - Test login/logout flow
  - _Requirements: 4.4, 6.4_

- [x] 9. Tạo layout và navigation

  - Tạo Header.vue và Footer.vue từ PHP layouts
  - Tạo AdminLayout.vue với sidebar collapse menu
  - Implement navigation menu cho quản lý mượn sách
  - Adapt responsive design từ CSS hiện tại
  - Test navigation và layout
  - _Requirements: 4.2, 7.2_

- [x] 10. Implement DocGia management UI

  - Tạo DocGia.vue view với CRUD operations
  - Implement search và pagination
  - Tạo form validation
  - Test user interactions
  - _Requirements: 5.1_

- [x] 11. Implement Sach management UI

  - Tạo Sach.vue view với CRUD operations
  - Implement search và pagination
  - Tạo form validation với NhaXuatBan dropdown
  - Test user interactions
  - _Requirements: 5.2_

- [x] 12. Implement NhaXuatBan management UI

  - Tạo NhaXuatBan.vue view với CRUD operations
  - Implement search và pagination
  - Tạo form validation
  - Test user interactions
  - _Requirements: 5.3_

- [x] 13. Implement TheoDoiMuonSach management UI

  - Tạo TheoDoiMuonSach.vue view với mượn/trả sách
  - Implement search theo độc giả và sách
  - Tạo business logic cho mượn/trả sách
  - Test workflow mượn trả sách
  - _Requirements: 5.4_

- [x] 14. Tạo Dashboard với thống kê

  - Tạo Dashboard.vue với layout giống PHP admin
  - Implement StatsCard.vue component cho thống kê cards
  - Tạo API endpoints cho statistics (tổng sách, độc giả, mượn sách)
  - Hiển thị danh sách mới nhất và top items
  - Test dashboard data loading và responsive
  - _Requirements: 5.5_

- [x] 15. Implement reusable components

  - Tạo Sidebar.vue component với collapse menu
  - Tạo DataTable.vue component với styling giống PHP
  - Tạo SearchBox.vue và Pagination.vue components
  - Tạo Modal.vue component cho forms

  - Test component reusability và styling
  - _Requirements: 7.2_

- [x] 16. Implement error handling





  - Tạo error handling middleware cho backend
  - Implement Axios interceptors cho frontend
  - Tạo user-friendly error messages
  - Test error scenarios
  - _Requirements: 1.1, 4.4_

- [ ] 17. Add form validation

  - Implement backend validation với Mongoose
  - Implement frontend validation với Vue
  - Tạo validation messages tiếng Việt
  - Test validation cho tất cả forms
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

- [ ] 18. Optimize performance

  - Add MongoDB indexes cho search fields
  - Implement lazy loading cho Vue routes
  - Optimize API response sizes
  - Test performance improvements
  - _Requirements: 3.6_

- [ ] 19. Final testing và cleanup

  - Test toàn bộ application workflow
  - Fix bugs và issues
  - Clean up unused code
  - Update documentation
  - _Requirements: All requirements_

- [ ] 20. Deployment preparation
  - Tạo production build scripts
  - Cấu hình environment cho production
  - Test production build
  - Tạo deployment instructions
  - _Requirements: 7.4, 7.5_
