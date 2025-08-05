# Hướng dẫn thiết lập Images cho dự án

## 📁 Cấu trúc thư mục

Trong dự án Vue.js với Vite, tất cả static assets (images, fonts, etc.) nên được đặt trong thư mục `public/`:

```
frontend/
├── public/
│   ├── images/
│   │   ├── library-hero-1.jpg     # Hero carousel image 1
│   │   ├── library-hero-2.jpg     # Hero carousel image 2  
│   │   ├── library-hero-3.jpg     # Hero carousel image 3
│   │   ├── library-logo.png       # Logo thư viện
│   │   ├── book-placeholder.jpg   # Placeholder cho sách
│   │   └── avatar-default.jpg     # Avatar mặc định
│   └── favicon.ico
├── src/
└── ...
```

## 🖼️ Images cần thiết

### 1. Hero Images (Carousel)
- **File names**: `library-hero-1.jpg`, `library-hero-2.jpg`, `library-hero-3.jpg`
- **Kích thước**: 1920x400px (tỷ lệ 4.8:1)
- **Nội dung gợi ý**:
  - Hero 1: Hình ảnh thư viện với kệ sách
  - Hero 2: Người đọc sách hoặc không gian học tập
  - Hero 3: Công nghệ thư viện hiện đại

### 2. Logo
- **File name**: `library-logo.png`
- **Kích thước**: 200x200px (PNG với background trong suốt)
- **Sử dụng**: Header, footer, favicon

### 3. Placeholder Images
- **book-placeholder.jpg**: 300x400px (tỷ lệ 3:4) - cho sách không có ảnh bìa
- **avatar-default.jpg**: 200x200px (hình vuông) - cho user không có avatar

## 🔧 Cách sử dụng trong code

### Trong Vue Template:
```vue
<template>
  <!-- Đường dẫn bắt đầu bằng / -->
  <img src="/images/library-logo.png" alt="Logo">
  
  <!-- Với error handling -->
  <img 
    src="/images/library-hero-1.jpg" 
    alt="Hero"
    @error="handleImageError"
  >
</template>
```

### Trong CSS:
```css
.hero-bg {
  background-image: url('/images/library-hero-1.jpg');
}
```

### Dynamic image paths:
```javascript
const getBookImage = (book) => {
  return book.image || '/images/book-placeholder.jpg'
}
```

## 🎨 Tạo Images tạm thời

Nếu chưa có images thật, bạn có thể:

### 1. Sử dụng placeholder services:
```html
<!-- Hero images -->
<img src="https://via.placeholder.com/1920x400/4f46e5/ffffff?text=Library+Hero+1">
<img src="https://via.placeholder.com/1920x400/059669/ffffff?text=Library+Hero+2">
<img src="https://via.placeholder.com/1920x400/dc2626/ffffff?text=Library+Hero+3">

<!-- Logo -->
<img src="https://via.placeholder.com/200x200/1f2937/ffffff?text=LOGO">

<!-- Book placeholder -->
<img src="https://via.placeholder.com/300x400/6b7280/ffffff?text=Book+Cover">

<!-- Avatar -->
<img src="https://via.placeholder.com/200x200/374151/ffffff?text=Avatar">
```

### 2. Sử dụng Unsplash (free images):
- Hero images: Tìm "library", "books", "reading"
- Logo: Tạo bằng Canva hoặc design tools
- Book covers: Tìm "book cover", "book spine"

### 3. Tạo solid color placeholders:
```css
.image-placeholder {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
}
```

## 🚀 Tối ưu hóa Images

### 1. Nén images:
- Sử dụng tools như TinyPNG, ImageOptim
- Target: < 500KB cho hero images, < 100KB cho thumbnails

### 2. Responsive images:
```vue
<template>
  <picture>
    <source media="(max-width: 768px)" srcset="/images/hero-mobile.jpg">
    <source media="(max-width: 1200px)" srcset="/images/hero-tablet.jpg">
    <img src="/images/hero-desktop.jpg" alt="Hero">
  </picture>
</template>
```

### 3. Lazy loading:
```vue
<template>
  <img 
    src="/images/book-placeholder.jpg"
    :data-src="book.image"
    alt="Book cover"
    loading="lazy"
  >
</template>
```

## 🛠️ Error Handling

Tất cả images đã được setup với error handling:

```javascript
const handleImageError = (event) => {
  // Fallback to placeholder
  event.target.src = '/images/book-placeholder.jpg'
}

const handleLogoError = (event) => {
  // Hide logo if fails to load
  event.target.style.display = 'none'
}
```

## 📱 Responsive Considerations

### CSS cho responsive images:
```css
.hero-image {
  width: 100%;
  height: 400px;
  object-fit: cover;
}

@media (max-width: 768px) {
  .hero-image {
    height: 250px;
  }
}

.book-thumb {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
}
```

## 🔍 Testing Images

### 1. Kiểm tra images load:
```javascript
// Test if image exists
const imageExists = (url) => {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve(true)
    img.onerror = () => resolve(false)
    img.src = url
  })
}
```

### 2. Performance testing:
- Sử dụng Chrome DevTools Network tab
- Kiểm tra loading time < 3s
- Optimize images nếu cần

## 📋 Checklist

- [ ] Tạo thư mục `frontend/public/images/`
- [ ] Thêm hero images (3 files)
- [ ] Thêm logo (PNG với background trong suốt)
- [ ] Thêm book placeholder
- [ ] Thêm avatar default
- [ ] Test tất cả images load correctly
- [ ] Kiểm tra responsive trên mobile
- [ ] Verify error handling hoạt động
- [ ] Optimize file sizes

## 🎯 Quick Start

Để nhanh chóng test giao diện, bạn có thể:

1. Download sample images từ Unsplash
2. Rename theo convention trên
3. Copy vào `frontend/public/images/`
4. Restart dev server: `npm run dev`

Images sẽ accessible tại: `http://localhost:5173/images/filename.jpg`