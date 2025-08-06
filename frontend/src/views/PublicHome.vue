<template>
    <div class="public-home">
        <!-- Hero Carousel -->
        <div class="hero-section mb-5">
            <div id="heroCarousel" class="carousel slide" data-bs-ride="carousel" data-bs-interval="3000">
                <div class="carousel-inner rounded-4 shadow">
                    <div class="carousel-item active">
                        <img src="/images/slider_4.jpg" class="d-block w-100 hero-image" alt="Thư viện sách"
                            @error="handleImageError">
                        <div class="carousel-caption d-none d-md-block">
                            <h2>Khám phá thế giới tri thức</h2>
                            <p>Hàng ngàn đầu sách đang chờ bạn khám phá</p>
                        </div>
                    </div>
                    <div class="carousel-item">
                        <img src="/images/slider_5.jpg" class="d-block w-100 hero-image" alt="Đọc sách"
                            @error="handleImageError">
                        <div class="carousel-caption d-none d-md-block">
                            <h2>Mượn sách dễ dàng</h2>
                            <p>Hệ thống quản lý mượn trả hiện đại và tiện lợi</p>
                        </div>
                    </div>
                    <div class="carousel-item">
                        <img src="/images/slider_6.jpg" class="d-block w-100 hero-image" alt="Học tập"
                            @error="handleImageError">
                        <div class="carousel-caption d-none d-md-block">
                            <h2>Không gian học tập lý tưởng</h2>
                            <p>Môi trường yên tĩnh, thuận lợi cho việc học tập</p>
                        </div>
                    </div>
                </div>
                <button class="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
                    <span class="carousel-control-prev-icon"></span>
                    <span class="visually-hidden">Previous</span>
                </button>
                <button class="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
                    <span class="carousel-control-next-icon"></span>
                    <span class="visually-hidden">Next</span>
                </button>
            </div>
        </div>

        

        <!-- Categories Section -->
        <div class="categories-section mb-5">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="mb-0">
                    <i class="fas fa-tags text-primary me-2"></i>
                    Các nhà xuất bản
                </h2>
                <router-link to="/categories" class="btn btn-outline-primary">
                    <i class="fas fa-eye me-1"></i>
                    Xem tất cả
                </router-link>
            </div>

            <div class="row g-4" v-if="categories.length > 0">
                <div v-for="category in categories.slice(0, 6)" :key="category.id" class="col-md-6 col-lg-4">
                    <div class="card h-100 shadow-sm border-0 category-card" @click="viewCategory(category.id)">
                        <div class="card-body d-flex flex-column">
                            <div class="d-flex align-items-center mb-3">
                                <div
                                    class="category-icon bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                                    <i class="fas fa-book"></i>
                                </div>
                                <div>
                                    <h5 class="card-title mb-1">{{ category.TenNhaXuatBan }}</h5>
                                    <small class="text-muted">
                                        <i class="fas fa-book-open me-1"></i>
                                        {{ category.SoSach || 0 }} sách
                                    </small>
                                </div>
                            </div>

                            <p class="card-text text-muted mb-3" v-if="category.DiaChi">
                                {{ category.DiaChi }}
                            </p>

                            <div class="mt-auto">
                                <button class="btn btn-outline-primary w-100">
                                    <i class="fas fa-arrow-right me-2"></i>
                                    Xem sách
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="text-center py-5">
                <i class="fas fa-tags fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Chưa có thể loại nào</h5>
            </div>
        </div>

        <!-- New Books Section -->
        <div class="new-books-section mb-5">
            <div class="d-flex justify-content-between align-items-center mb-4">
                <h2 class="mb-0">
                    <i class="fas fa-star text-warning me-2"></i>
                    Sách mới nhất
                </h2>
                <router-link to="/books" class="btn btn-outline-primary">
                    <i class="fas fa-eye me-1"></i>
                    Xem tất cả
                </router-link>
            </div>

            <div class="row g-4" v-if="newBooks.length > 0">
                <div v-for="book in newBooks.slice(0, 8)" :key="book.MaSach" class="col-6 col-sm-4 col-md-3 col-lg-2">
                    <div class="card h-100 shadow-sm border-0 book-card" @click="viewBook(book.MaSach)">
                        <div class="position-relative">
                            <img src="/images/dacnhantam.jpg" class="card-img-top book-thumb" :alt="book.TenSach">
                            <div class="position-absolute top-0 end-0 m-2">
                                <span class="badge bg-success">Mới</span>
                            </div>
                            <div class="position-absolute bottom-0 start-0 end-0 bg-dark bg-opacity-75 text-white p-2">
                                <small class="text-xs">
                                    <i class="fas fa-book me-1"></i>
                                    {{ book.SoQuyen }} quyển
                                </small>
                            </div>
                        </div>
                        <div class="card-body p-2">
                            <h6 class="card-title text-dark fw-semibold mb-1 text-truncate">
                                {{ book.TenSach }}
                            </h6>
                            <p class="card-text text-muted small mb-1">{{ book.NguonGoc }}</p>
                            <p class="card-text text-primary small mb-0">
                                <strong>{{ formatPrice(book.DonGia) }}</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="text-center py-5">
                <i class="fas fa-book fa-3x text-muted mb-3"></i>
                <h5 class="text-muted">Chưa có sách nào</h5>
            </div>
        </div>

        
    </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from '@/utils/axios'

export default {
    name: 'PublicHome',
    setup() {
        const router = useRouter()
        const searchQuery = ref('')
        const categories = ref([])
        const newBooks = ref([])
        const stats = ref({
            totalBooks: 0,
            totalCategories: 0,
            totalReaders: 0,
            totalBorrows: 0
        })

        const loadCategories = async () => {
            try {
                const response = await axios.get('/nhaxuatban?limit=6')
                categories.value = response.data.data.nhaxuatban || []
            } catch (error) {
                console.error('Error loading categories:', error)
            }
        }

        const loadNewBooks = async () => {
            try {
                const response = await axios.get('/sach?limit=8&sortBy=createdAt&sortOrder=desc')
                newBooks.value = response.data.data || []
            } catch (error) {
                console.error('Error loading new books:', error)
            }
        }

        const loadStats = async () => {
            try {
                const [booksRes, categoriesRes, readersRes] = await Promise.all([
                    axios.get('/sach?limit=1'),
                    axios.get('/nhaxuatban?limit=1'),
                    axios.get('/docgia?limit=1')
                ])

                stats.value = {
                    totalBooks: booksRes.data.data.pagination?.total || 0,
                    totalCategories: categoriesRes.data.data.pagination?.total || 0,
                    totalReaders: readersRes.data.data.pagination?.total || 0,
                    totalBorrows: 0 // Will be updated when we have borrow API
                }
            } catch (error) {
                console.error('Error loading stats:', error)
            }
        }

        const searchBooks = () => {
            if (searchQuery.value.trim()) {
                router.push({ name: 'Books', query: { search: searchQuery.value.trim() } })
            }
        }

        const viewCategory = (categoryId) => {
            router.push({ name: 'CategoryBooks', params: { id: categoryId } })
        }

        const viewBook = (bookId) => {
            router.push({ name: 'BookDetail', params: { id: bookId } })
        }

        const getBookImage = (book) => {
            // In a real app, this would come from book.image or similar field
            return book.image || '/images/book-placeholder.svg'
        }

        const handleImageError = (event) => {
            // Fallback to a solid color background if image fails to load
            event.target.style.backgroundColor = '#f8f9fa'
            event.target.style.display = 'flex'
            event.target.style.alignItems = 'center'
            event.target.style.justifyContent = 'center'
            event.target.innerHTML = '<div class="text-muted"><i class="fas fa-image fa-3x"></i><br>Hình ảnh không khả dụng</div>'
        }

        const formatPrice = (price) => {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(price)
        }

        onMounted(() => {
            loadCategories()
            loadNewBooks()
            loadStats()
            // Đảm bảo Bootstrap Carousel tự động chuyển slide sau 3s
            if (typeof window !== 'undefined' && window.bootstrap) {
                const carouselEl = document.getElementById('heroCarousel')
                if (carouselEl) {
                    // eslint-disable-next-line no-undef
                    new window.bootstrap.Carousel(carouselEl, {
                        interval: 3000,
                        ride: 'carousel',
                        pause: false
                    })
                }
            }
        })

        return {
            searchQuery,
            categories,
            newBooks,
            stats,
            searchBooks,
            viewCategory,
            viewBook,
            getBookImage,
            handleImageError,
            formatPrice
        }
    }
}
</script>

<style>
@import '@/assets/styles/pages/home.css';
</style>