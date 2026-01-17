import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
    plugins: [react()],
    build: {
        outDir: 'dist',
        emptyOutDir: true,
        rollupOptions: {
            input: {
                popup: resolve(__dirname, 'popup.html'),
                background: resolve(__dirname, 'src/background/index.ts'),
                'solomedia-bridge': resolve(__dirname, 'src/content/solomedia-bridge.ts'),
                douyin: resolve(__dirname, 'src/content/douyin.ts'),
                xiaohongshu: resolve(__dirname, 'src/content/xiaohongshu.ts'),
            },
            output: {
                entryFileNames: 'src/[name]/[name].js',
                chunkFileNames: 'assets/[name]-[hash].js',
                assetFileNames: 'assets/[name]-[hash].[ext]',
            },
        },
    },
});
