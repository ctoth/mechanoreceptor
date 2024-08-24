import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'Mechanoreceptor',
      fileName: (format) => `mechanoreceptor.${format}.js`,
    },
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'test.html'),
      },
    },
  },
  server: {
    port: 3000,
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  optimizeDeps: {
    exclude: ['docs/**/*'],
  },
});
