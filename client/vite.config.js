import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './', // ✅ Very important for relative paths
  build: {
    outDir: 'dist', // ✅ Ensure output directory
  },
  plugins: [react()],
});
