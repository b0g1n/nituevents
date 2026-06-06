import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    // WordPress deployment: use relative paths for subfolder compatibility
    base: './',
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          // Stable filenames for WordPress
          entryFileNames: 'assets/index.js',
          chunkFileNames: 'assets/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            // Keep favicon at root
            if (name && name.includes('favicon')) {
              return '[name][extname]';
            }
            if (name && name.endsWith('.css')) {
              return 'assets/index.css';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
    },
  };
});
