import { defineConfig } from 'vite';
import htmlInline from 'vite-plugin-html-inline';

export default defineConfig({
  plugins: [htmlInline({
    inject: {
      injectData: {
        inline: true,
      },
    },
  })],
  build: {
    outDir: '../../..', // Change 'dist' to your desired output directory
  },
});