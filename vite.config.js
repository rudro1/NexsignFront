// vite.config.js
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path  from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const backendOrigin = (env.VITE_API_BASE_URL || 'https://nextsignbackendfinal.vercel.app/api')
    .replace(/\/api$/, ''); // → https://nextsignbackendfinal.vercel.app

  return {
    plugins: [react({ fastRefresh: true })],

    // ── Aliases ───────────────────────────────────────────────
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },

    // ── Dev server ────────────────────────────────────────────
    server: {
      port: 5173,
      host: true,
      proxy: {
        '/api': {
          target:       backendOrigin,  // https://nextsignbackendfinal.vercel.app
          changeOrigin: true,
          secure:       true,
          // /api/users → /api/users (no rewrite needed)
        },
      },
    },

    // ── Preview ───────────────────────────────────────────────
    preview: {
      port: 4173,
      host: true,
    },

    // ── Build ─────────────────────────────────────────────────
    build: {
      outDir:    'dist',
      target:    'esnext',
      sourcemap: mode === 'development',
      minify:    'esbuild',
      commonjsOptions: { transformMixedEsModules: true },
      chunkSizeWarningLimit: 1000,

      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react':    ['react', 'react-dom', 'react-router-dom'],
            'vendor-query':    ['@tanstack/react-query'],
            'vendor-pdf':      ['pdfjs-dist'],
            'vendor-motion':   ['framer-motion'],
            'vendor-firebase': ['firebase/app', 'firebase/auth'],
            'vendor-rnd':      ['react-rnd'],
          },
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: 'assets/[ext]/[name]-[hash].[ext]',
        },
      },
    },

    // ── Optimize deps ─────────────────────────────────────────
  optimizeDeps: {
  include: [
    'react', 'react-dom', 'react-router-dom',
    '@tanstack/react-query',
    'framer-motion', 'lucide-react',
    'sonner', 'date-fns', 'axios',
    'pdfjs-dist',  // ← add করো
  ],
},
  };
});