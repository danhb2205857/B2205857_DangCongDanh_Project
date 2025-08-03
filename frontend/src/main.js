import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import { useAuth } from './composables/useAuth.js';
import { globalErrorHandler } from './composables/useErrorHandler.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/layout.css';

const app = createApp(App);
app.use(router);

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global error:', err, info);
  globalErrorHandler.handleApiError(err, 'Đã xảy ra lỗi không xác định');
};

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
  globalErrorHandler.handleApiError(event.reason, 'Đã xảy ra lỗi không xác định');
  event.preventDefault();
});

// Initialize authentication state
const { initAuth } = useAuth();
initAuth();

app.mount('#app');