import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // Allow your ngrok host
    allowedHosts: ['fba217db69f6.ngrok-free.app', 'localhost'],
    port: 5173,  // make sure this matches your dev server port
  },
});
