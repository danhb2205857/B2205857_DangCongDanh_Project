# Public Interface Components

Đây là tài liệu mô tả các component Vue mới được tạo cho giao diện công cộng của hệ thống thư viện mượn sách, được chuyển đổi từ các view PHP ban đầu.

## Cấu trúc Components

### 1. Layout Components

#### `PublicLayout.vue`

- Layout chính cho giao diện công cộng
- Bao gồm header, footer và main content area
- Responsive design với Bootstrap 5
- Hỗ trợ loading overlay

#### `PublicHeader.vue`

- Header navigation cho giao diện công cộng
- Menu điều hướng với dropdown cho nhà xuất bản
- Thanh tìm kiếm tích hợp
- User menu với authentication state
- Responsive mobile menu

#### `PublicFooter.vue`

- Footer với thông tin liên hệ
- Links hữu ích và social media
- Thống kê thư viện (số sách, thành viên, etc.)
- Back to top button
- Copyright information

### 2. View Components

#### `PublicHome.vue`

- Trang chủ của giao diện công cúng
- Hero carousel với hình ảnh thư viện
- Thanh tìm kiếm nổi bật
- Danh sách nhà xuất bản (categories)
- Sách mới nhất
- Thống kê tổng quan

**Tính năng:**

- Carousel tự động chuyển slide
- Tìm kiếm sách theo từ khóa
- Hiển thị top 6 nhà xuất bản
- Hiển thị 8 sách mới nhất
- Thống kê realtime từ API

#### `Categories.vue`

- Trang danh sách nhà xuất bản
- Tìm kiếm và sắp xếp nhà xuất bản
- Pagination hỗ trợ
- Thống kê nhà xuất bản

**Tính năng:**

- Search với debounce
- Sort theo tên, ngày tạo, số sách
- Pagination với page numbers
- Card view với hover effects
- Empty state handling

#### `BooksList.vue`

- Trang danh sách sách (tất cả hoặc theo nhà xuất bản)
- Hỗ trợ 2 chế độ xem: Grid và List
- Bộ lọc và tìm kiếm nâng cao
- Pagination

**Tính năng:**

- Grid view và List view
- Advanced filtering (availability, sort, search)
- Responsive design
- Book thumbnails với placeholder
- Price formatting (VND)
- Stock status badges

#### `Profile.vue`

- Trang profile độc giả
- Quản lý thông tin cá nhân
- Lịch sử mượn sách
- Sách đang mượn
- Cài đặt tài khoản

**Tính năng:**

- Tabbed interface
- Avatar upload
- Profile editing
- Borrow history table
- Current borrows cards
- Statistics cards
- Settings management

## Routing Structure

```
/ (PublicLayout)
├── '' (PublicHome) - Trang chủ
├── categories (Categories) - Danh sách nhà xuất bản
├── categories/:id (BooksList) - Sách theo nhà xuất bản
├── books (BooksList) - Tất cả sách
├── books/:id (BookDetail) - Chi tiết sách
├── profile (Profile) - Profile người dùng
├── my-borrows (MyBorrows) - Sách đang mượn
├── borrow-history (BorrowHistory) - Lịch sử mượn
└── about/contact/help/privacy/terms (Static pages)

/login - Đăng nhập
/register - Đăng ký

/admin (AdminLayout) - Admin interface
```

## API Integration

Các component sử dụng các API endpoints sau:

- `GET /api/nhaxuatban` - Danh sách nhà xuất bản
- `GET /api/sach` - Danh sách sách
- `GET /api/docgia` - Thông tin độc giả
- `GET /api/theodoimuonsach` - Lịch sử mượn sách
- `PUT /api/docgia/:id` - Cập nhật thông tin độc giả

## Styling và UX

### Design System

- Bootstrap 5 framework
- Font Awesome icons
- Custom CSS variables
- Responsive breakpoints

### Animations

- Hover effects cho cards
- Smooth transitions
- Loading states
- Fade in animations

### Accessibility

- ARIA labels
- Keyboard navigation
- Screen reader support
- Focus management

## Responsive Design

- **Mobile First**: Thiết kế ưu tiên mobile
- **Breakpoints**:
  - xs: <576px
  - sm: ≥576px
  - md: ≥768px
  - lg: ≥992px
  - xl: ≥1200px

## Performance Optimizations

- **Lazy Loading**: Components được lazy load
- **Image Optimization**: Placeholder images
- **Debounced Search**: Tránh spam API calls
- **Pagination**: Giới hạn số lượng items per page
- **Caching**: Local storage cho user data

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Notes

### Component Structure

```
components/
├── PublicHeader.vue
├── PublicFooter.vue
└── ...

layouts/
├── PublicLayout.vue
└── AdminLayout.vue

views/
├── PublicHome.vue
├── Categories.vue
├── BooksList.vue
├── Profile.vue
└── ...
```

### State Management

- Sử dụng Composition API
- Local state với ref/reactive
- Composables cho logic tái sử dụng
- Props/Events cho component communication

### Error Handling

- Try-catch blocks cho API calls
- User-friendly error messages
- Fallback UI states
- Loading indicators

## Future Enhancements

1. **PWA Support**: Service workers, offline mode
2. **Dark Mode**: Theme switching
3. **Advanced Search**: Filters, faceted search
4. **Wishlist**: Save favorite books
5. **Reviews**: User book reviews
6. **Notifications**: Real-time updates
7. **Multi-language**: i18n support

## Migration Notes

Các view PHP đã được chuyển đổi:

- `app/Views/layouts/header.php` → `PublicHeader.vue`
- `app/Views/layouts/footer.php` → `PublicFooter.vue`
- `app/Views/pages/home.php` → `PublicHome.vue`
- `app/Views/category/index.php` → `Categories.vue`
- `app/Views/user/profile.php` → `Profile.vue`
- `app/Views/auth/login.php` → Existing `Login.vue`

Các thay đổi chính:

- PHP → Vue.js Composition API
- Server-side rendering → Client-side rendering
- Bootstrap 4 → Bootstrap 5
- jQuery → Vanilla JS/Vue
- PHP sessions → JWT tokens
- MySQL queries → REST API calls
