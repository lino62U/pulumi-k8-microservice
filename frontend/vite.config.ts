import path from 'path';
import { defineConfig } from 'vite'; // No necesitas loadEnv
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    
    // Lee la variable de entorno del proceso de build (pasada por Docker)
    // const geminiApiKey = process.env.GEMINI_API_KEY; // <--- ELIMINADO

    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        // Inyecta la clave en tu código
        // 'process.env.API_KEY': JSON.stringify(geminiApiKey), // <--- ELIMINADO
        // 'process.env.GEMINI_API_KEY': JSON.stringify(geminiApiKey) // <--- ELIMINADO
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});