<template>
  <div class="public-layout">
    <div class="container">
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

