import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * @file vite.config.js
 * @description Configuración de Vite para HEROback Frontend.
 *
 * Proxy:
 *   Todas las peticiones a `/api/*` se redirigen al backend Express
 *   (http://localhost:3000 por defecto). Esto evita problemas de CORS y
 *   permite servir tanto la API como el proxy de imágenes
 *   (`/api/heroes/:id/image`) bajo el mismo origen relativo.
 *
 * Variable de entorno opcional: VITE_API_TARGET (ej. http://localhost:4000)
 */
export default defineConfig(({ mode }) => ({
    plugins: [react()],
    server: {
        port: 5173,
        host: true,
        proxy: {
            '/api': {
                target: process.env.VITE_API_TARGET || 'http://localhost:3000',
                changeOrigin: true,
                secure: false,
            },
        },
    },
    build: {
        outDir: 'dist',
        sourcemap: mode !== 'production',
    },
}));
