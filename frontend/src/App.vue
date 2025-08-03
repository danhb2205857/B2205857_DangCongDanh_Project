<template>
  <router-view />
  <ErrorNotification ref="errorNotificationRef" />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import ErrorNotification from './components/ErrorNotification.vue'
import { globalErrorHandler } from './composables/useErrorHandler.js'

const errorNotificationRef = ref(null)

onMounted(() => {
  // Set global error notification instance
  if (errorNotificationRef.value) {
    globalErrorHandler.setErrorNotificationInstance(errorNotificationRef.value)
  }
})
</script>