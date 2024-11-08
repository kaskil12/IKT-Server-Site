import { defineConfig } from 'vite';
import singleFile from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [singleFile()],
});