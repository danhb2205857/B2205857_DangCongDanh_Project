<template>
    <div class="admin-layout">
        <!-- Header -->
        <Header />

        <div class="layout-container">
            <!-- Sidebar -->
            <Sidebar />

            <!-- Main Content -->
            <main class="main-content" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
                <div class="content-wrapper">
                    <router-view />
                </div>
            </main>
        </div>

        <!-- Footer -->
        <Footer />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import Header from '../components/Header.vue'
import Sidebar from '../components/Sidebar.vue'
import Footer from '../components/Footer.vue'

const sidebarCollapsed = ref(false)

onMounted(() => {
    // Initialize sidebar state
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) {
        sidebarCollapsed.value = saved === 'true'
    }
})
</script>

<style scoped>
.admin-layout {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.layout-container {
    display: flex;
    flex: 1;
    position: relative;
}

.main-content {
    flex: 1;
    margin-left: 250px;
    margin-top: 60px;
    /* Height of header */
    transition: margin-left 0.3s ease;
    min-height: calc(100vh - 120px);
    /* Subtract header and footer height */
}

.main-content.sidebar-collapsed {
    margin-left: 60px;
}

.content-wrapper {
    padding: 2rem;
    max-width: 100%;
}

/* Responsive */
@media (max-width: 991.98px) {
    .main-content {
        margin-left: 0;
    }

    .main-content.sidebar-collapsed {
        margin-left: 0;
    }

    .content-wrapper {
        padding: 1rem;
    }
}

/* Header positioning */
:global(header.navbar) {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1040;
    height: 60px;
}

/* Footer positioning */
:global(footer) {
    margin-top: auto;
}
</style>