import { defineConfig } from 'vite';
import htmlInline from 'vite-plugin-html-inline';
import path from 'path';

export default defineConfig({
  plugins: [htmlInline({
    inject: {
      injectData: {
        inline: true,
      },
    },
  })],
  build: {
    outDir: path.resolve(__dirname, 'build'),  // Adjust the path as needed
  },
});
