import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâ€”file watching is disabled to prevent flickering during agent edits.
      hmr: false,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            // React core
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            // MUI component library
            'vendor-mui': [
              '@mui/material',
              '@mui/icons-material',
              '@mui/x-data-grid',
              '@emotion/react',
              '@emotion/styled',
            ],
            // Payment & utilities
            'vendor-utils': ['axios', 'zod', 'uuid', 'decimal.js'],
            // Animation
            'vendor-motion': ['motion'],
            // AI
            'vendor-ai': ['@google/genai'],
          },
        },
      },
    },
  };
});
