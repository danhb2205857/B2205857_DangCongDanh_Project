# Images Directory

Thư mục này chứa các hình ảnh static cho ứng dụng thư viện.

## Cấu trúc thư mục:

```
public/images/
├── library-hero-1.jpg          # Hero image 1 cho carousel
├── library-hero-2.jpg          # Hero image 2 cho carousel  
├── library-hero-3.jpg          # Hero image 3 cho carousel
├── library-logo.png            # Logo thư viện
├── book-placeholder.jpg        # Placeholder cho sách không có ảnh
├── avatar-default.jpg          # Avatar mặc định cho user
└── favicon.ico                 # Favicon của website
```

## Hướng dẫn sử dụng:

### 1. Trong Vue components:
```vue
<template>
  <img src="/images/library-logo.png" alt="Logo">
</template>
```

### 2. Trong CSS:
```css
.hero-bg {
  background-image: url('/images/library-hero-1.jpg');
}
```

### 3. Dynamic imports (nếu cần):
```javascript
import logoUrl from '/images/library-logo.png'
```

## Kích thước khuyến nghị:

- **Hero images**: 1920x400px (ratio 4.8:1)
- **Logo**: 200x200px (PNG với background trong suốt)
- **Book placeholder**: 300x400px (ratio 3:4)
- **Avatar default**: 200x200px (hình vuông)
- **Favicon**: 32x32px hoặc 16x16px

## Định dạng file:

- **Photos**: JPG (cho hero images, book covers)
- **Graphics/Icons**: PNG (cho logo, icons có background trong suốt)
- **Favicon**: ICO hoặc PNG

## Tối ưu hóa:

- Nén images trước khi upload
- Sử dụng WebP format nếu có thể
- Responsive images với srcset nếu cần
- Lazy loading cho images không critical

## Lưu ý:

- Tất cả images trong thư mục `public/` có thể truy cập trực tiếp qua URL
- Đường dẫn bắt đầu bằng `/` (ví dụ: `/images/logo.png`)
- Không cần import images từ thư mục public
- Images sẽ không được process bởi Vite build system