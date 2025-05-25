/// <reference types="vite/client" />
import * as path from 'path';
import { defineConfig, loadEnv, ConfigEnv, UserConfig } from 'vite';

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
    // Load environment variables from .env files
    const env = loadEnv(mode, process.cwd(), '');
    
    return {
        define: {
            // Make environment variables available in your client-side code
            'import.meta.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
            'process.env.VITE_GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY)
        },
        resolve: {
            alias: {
                '@': path.resolve(__dirname, '.'),
            }
        },
        // Ensure environment variables are loaded correctly in development
        server: {
            watch: {
                usePolling: true
            }
        }
    };
});
