<template>
    <footer class="bg-light border-top mt-auto py-3">
        <div class="container-fluid">
            <div class="row align-items-center">
                <div class="col-md-6">
                    <p class="mb-0 text-muted">

                    </p>
                </div>
                <div class="col-md-6 text-md-end">
                    <p class="mb-0 text-muted">
                        <small>Phiên bản 1.0.0</small>
                    </p>
                </div>
            </div>
        </div>
    </footer>
</template>

<script setup>
import { computed } from 'vue'

const currentYear = computed(() => new Date().getFullYear())
</script>

<style scoped>
footer {
    font-size: 0.875rem;
}

@media (max-width: 767.98px) {
    .col-md-6:last-child {
        text-align: center !important;
        margin-top: 0.5rem;
    }
}
</style>