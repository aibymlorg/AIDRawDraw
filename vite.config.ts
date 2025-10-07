import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      plugins: [react()],
      define: {
        'process.env.REACT_APP_LLM_PROVIDER': JSON.stringify(env.REACT_APP_LLM_PROVIDER),
        'process.env.REACT_APP_GEMINI_API_KEY': JSON.stringify(env.REACT_APP_GEMINI_API_KEY),
        'process.env.REACT_APP_OLLAMA_URL': JSON.stringify(env.REACT_APP_OLLAMA_URL),
        'process.env.REACT_APP_OLLAMA_MODEL': JSON.stringify(env.REACT_APP_OLLAMA_MODEL)
      },
      server: {
        open: true, 
        port: 5173, 
        allowedHosts: true  // allow all hosts  
      }, 
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
