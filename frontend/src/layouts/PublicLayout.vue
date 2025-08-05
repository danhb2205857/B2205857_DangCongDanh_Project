<template>
  <div class="public-layout">
    <!-- Header -->
    <PublicHeader />
    
    <!-- Main Content -->
    <main class="main-content">
      <div class="container-fluid px-3 px-md-4">
        <router-view />
      </div>
    </main>
    
    <!-- Footer -->
    <PublicFooter />
    
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Đang tải...</span>
        </div>
        <p class="mt-3 text-muted">Đang tải dữ liệu...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import PublicHeader from '@/components/PublicHeader.vue'
import PublicFooter from '@/components/PublicFooter.vue'

export default {
  name: 'PublicLayout',
  components: {
    PublicHeader,
    PublicFooter
  },
  setup() {
    const route = useRoute()
    
    // Global loading state - can be managed by a store in real app
    const isLoading = computed(() => {
      // You can connect this to a global loading state
      return false
    })

    return {
      isLoading
    }
  }
}
</script>

<style scoped>
.public-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
  padding-top: 80px; /* Account for fixed header */
  min-height: calc(100vh - 80px);
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  text-align: center;
}

.loading-spinner .spinner-border {
  width: 3rem;
  height: 3rem;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main-content {
    padding-top: 70px;
  }
}

/* Smooth transitions */
.main-content {
  transition: padding-top 0.3s ease;
}

/* Custom scrollbar */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* Focus styles for accessibility */
.main-content:focus {
  outline: none;
}

/* Print styles */
@media print {
  .main-content {
    padding-top: 0;
  }
  
  .loading-overlay {
    display: none;
  }
}
</style>

<style>
/* Global styles for public layout */
body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  color: #333;
}

/* Bootstrap overrides */
.btn {
  border-radius: 0.375rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card {
  border-radius: 0.5rem;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

/* Custom animations */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-in {
  animation: fadeIn 0.6s ease-out;
}

/* Utility classes */
.text-truncate-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.text-truncate-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* Loading states */
.skeleton {
  background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: loading 1.5s infinite;
}

@keyframes loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* Responsive images */
img {
  max-width: 100%;
  height: auto;
}

/* Form improvements */
.form-control:focus,
.form-select:focus {
  border-color: #0d6efd;
  box-shadow: 0 0 0 0.2rem rgba(13, 110, 253, 0.25);
}

/* Table improvements */
.table {
  border-radius: 0.5rem;
  overflow: hidden;
}

.table thead th {
  border-bottom: 2px solid #dee2e6;
  font-weight: 600;
}

/* Alert improvements */
.alert {
  border-radius: 0.5rem;
  border: none;
}

/* Badge improvements */
.badge {
  font-weight: 500;
  padding: 0.375rem 0.75rem;
}

/* Modal improvements */
.modal-content {
  border-radius: 0.5rem;
  border: none;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.modal-header {
  border-bottom: 1px solid #dee2e6;
  padding: 1.5rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  border-top: 1px solid #dee2e6;
  padding: 1.5rem;
}
</style>