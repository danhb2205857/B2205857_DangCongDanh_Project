import { createApp } from 'vue';
import App from './App.vue';
import router from './router/index.js';
import { useAuth } from './composables/useAuth.js';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './assets/layout.css';

const app = createApp(App);
app.use(router);

// Initialize authentication state
const { initAuth } = useAuth();
initAuth();

app.mount('#app');