<template>
    <div class="admin-layout">
        <!-- Header -->
        <Header />

        <div class="layout-container">
            <!-- Sidebar -->
            <Sidebar v-model="sidebarCollapsed" @nav-click="handleNavClick" />

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

const handleNavClick = () => {
    // Handle navigation click if needed
    // For mobile, might want to close sidebar
    if (window.innerWidth <= 768) {
        sidebarCollapsed.value = true
    }
}

onMounted(() => {
    // Initialize sidebar state
    const saved = localStorage.getItem('sidebarCollapsed')
    if (saved !== null) {
        sidebarCollapsed.value = saved === 'true'
    }
})
</script>

