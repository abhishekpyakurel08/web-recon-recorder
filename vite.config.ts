import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import fs from 'fs';

// Custom Vite plugin to copy manifest.json & public assets to dist
function copyManifestAndPublic() {
  return {
    name: 'copy-manifest-and-public',
    closeBundle() {
      const publicDir = resolve(__dirname, 'public');
      const distDir = resolve(__dirname, 'dist');

      if (!fs.existsSync(distDir)) {
        fs.mkdirSync(distDir, { recursive: true });
      }

      // Copy manifest.json
      const manifestPath = resolve(publicDir, 'manifest.json');
      if (fs.existsSync(manifestPath)) {
        fs.copyFileSync(manifestPath, resolve(distDir, 'manifest.json'));
      }

      // Copy icons folder if present
      const iconsDir = resolve(publicDir, 'icons');
      const distIconsDir = resolve(distDir, 'icons');
      if (fs.existsSync(iconsDir)) {
        if (!fs.existsSync(distIconsDir)) {
          fs.mkdirSync(distIconsDir, { recursive: true });
        }
        const files = fs.readdirSync(iconsDir);
        for (const file of files) {
          fs.copyFileSync(resolve(iconsDir, file), resolve(distIconsDir, file));
        }
      }
    },
  };
}

export default defineConfig({
  plugins: [react(), copyManifestAndPublic()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'popup.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
        content: resolve(__dirname, 'src/content/index.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          if (chunkInfo.name === 'background') {
            return 'background.js';
          }
          if (chunkInfo.name === 'content') {
            return 'content.js';
          }
          return 'assets/[name]-[hash].js';
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
});
