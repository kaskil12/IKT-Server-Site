import { defineConfig } from 'vite';
import * as singleFile from 'vite-plugin-singlefile';

export default defineConfig({
  plugins: [singleFile.default()],
});
