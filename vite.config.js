import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/sudoku-115/',
  plugins: [react()],
  build: {
    outDir: 'dist'
  }
});
