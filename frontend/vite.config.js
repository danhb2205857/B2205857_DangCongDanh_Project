import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 3001,
    host: '0.0.0.0',
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
  define: {
    // Suppress Node.js deprecation warnings in browser
    'process.env.NODE_NO_WARNINGS': '1'
  }
});