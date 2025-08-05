# Cấu trúc CSS của dự án

## Tổng quan

Dự án đã được tổ chức lại CSS theo cấu trúc modular để dễ bảo trì và mở rộng. Tất cả CSS đã được tách ra khỏi các file Vue component và được tổ chức thành các file riêng biệt.

## Cấu trúc thư mục

```
frontend/src/assets/styles/
├── main.css                 # File CSS chính, import tất cả
├── components.css           # CSS cho các component
├── pages.css               # CSS cho các trang
├── layouts.css             # CSS cho các layout
├── cards.css               # CSS cho các card component
├── forms.css               # CSS cho các form element
├── buttons.css             # CSS cho các button
├── modals.css              # CSS cho các modal
├── tables.css              # CSS cho các table
├── utilities.css           # CSS utility classes
├── animations.css          # CSS animations và transitions
└── pages/                  # CSS riêng cho từng trang
    ├── home.css
    ├── categories.css
    ├── static-pages.css
    └── auth.css            # CSS cho Login/Register
```

## Cách sử dụng

### 1. Import CSS chính

Trong `main.js`, chỉ cần import file CSS chính:

```javascript
import './assets/styles/main.css';
```

### 2. CSS trong Vue components

Thay vì viết CSS trực tiếp trong `<style>`, import CSS từ file tương ứng:

```vue
<template>
  <!-- Component template -->
</template>

<script>
// Component logic
</script>

<style>
@import '@/assets/styles/pages/home.css';

/* Chỉ thêm CSS specific cho component này nếu cần */
.component-specific-class {
  /* styles */
}
</style>
```

### 3. Thêm CSS mới

#### Cho component mới:
- Thêm CSS vào file `components.css` hoặc file tương ứng
- Hoặc tạo file CSS riêng và import vào `components.css`

#### Cho trang mới:
- Tạo file CSS trong `pages/` folder
- Import vào `pages.css`
- Import vào Vue component

#### Cho utility classes:
- Thêm vào `utilities.css`

## Các file CSS chính

### 1. `main.css`
- Import Bootstrap và Font Awesome
- Import tất cả CSS custom
- Global styles cho toàn bộ app

### 2. `components.css`
- CSS cho header, footer, sidebar
- CSS cho các component tái sử dụng
- Import tất cả các file CSS component khác

### 3. `layouts.css`
- CSS cho PublicLayout và AdminLayout
- Responsive layout styles

### 4. `cards.css`
- CSS cho tất cả các loại card
- Hover effects, transitions
- Card variants (category-card, book-card, etc.)

### 5. `forms.css`
- CSS cho form controls
- Input groups, validation styles
- Form layouts

### 6. `buttons.css`
- CSS cho tất cả button variants
- Button sizes, states
- Special buttons (floating, icon buttons)

### 7. `modals.css`
- CSS cho modal components
- Modal animations, sizes
- Modal specific layouts

### 8. `tables.css`
- CSS cho table components
- Table variants, responsive tables
- Table actions, sorting

### 9. `utilities.css`
- Utility classes (spacing, display, flex, etc.)
- Text utilities, positioning
- Custom utility classes

### 10. `animations.css`
- CSS animations và keyframes
- Transition effects
- Hover animations

## Quy tắc đặt tên

### CSS Classes
- Sử dụng kebab-case: `.category-card`, `.book-thumb`
- Prefix cho component: `.navbar-brand`, `.sidebar-nav`
- Modifier classes: `.btn-primary`, `.card-hover`

### CSS Files
- Sử dụng kebab-case cho tên file
- Tên file mô tả chức năng: `forms.css`, `buttons.css`
- Tên file trang: `home.css`, `categories.css`

## Best Practices

### 1. Tổ chức CSS
- Nhóm CSS theo chức năng, không theo component
- Sử dụng comments để phân chia sections
- Giữ CSS DRY (Don't Repeat Yourself)

### 2. Responsive Design
- Mobile-first approach
- Sử dụng Bootstrap breakpoints
- Test trên nhiều kích thước màn hình

### 3. Performance
- Tránh CSS không sử dụng
- Sử dụng CSS shorthand properties
- Optimize selectors

### 4. Maintainability
- Comment cho CSS phức tạp
- Sử dụng CSS variables cho colors, spacing
- Consistent naming convention

## Migration từ inline CSS

Khi tách CSS từ Vue components:

1. Copy CSS từ `<style>` tag
2. Paste vào file CSS tương ứng
3. Remove `<style>` tag hoặc thay bằng `@import`
4. Test để đảm bảo styles vẫn hoạt động

## Files đã được dọn dẹp

### Files đã xóa:
- ❌ `frontend/src/assets/bootstrap-classes.css` - Không cần thiết với cấu trúc mới
- ❌ `frontend/src/assets/main_admin.css` - Đã được thay thế bằng `styles/main.css`
- ❌ `frontend/src/assets/main.css` - Đã được thay thế bằng `styles/main.css`
- ❌ `frontend/src/assets/layout.css` - Đã được tách thành `layouts.css`
- ❌ `frontend/CSS_WARNINGS_FIX.md` - Không còn cần thiết

### Files đã cập nhật:
- ✅ Tất cả Vue components đã được cập nhật để sử dụng CSS structure mới
- ✅ `main.js` chỉ import một file CSS duy nhất
- ✅ CSS đã được tách khỏi Vue components

## Troubleshooting

### CSS không load
- Kiểm tra đường dẫn import
- Đảm bảo file CSS tồn tại
- Check console cho CSS errors

### Styles bị override
- Kiểm tra CSS specificity
- Sử dụng developer tools để debug
- Đảm bảo import order đúng

### Performance issues
- Kiểm tra kích thước CSS bundle
- Remove unused CSS
- Optimize CSS selectors

## Kết luận

Cấu trúc CSS mới giúp:
- Dễ bảo trì và mở rộng
- Tái sử dụng code tốt hơn
- Performance tốt hơn
- Collaboration dễ dàng hơn

Khi thêm features mới, hãy tuân theo cấu trúc này để đảm bảo consistency.