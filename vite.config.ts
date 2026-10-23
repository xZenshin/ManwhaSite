import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { manhwaDataWriter } from './plugins/manhwaDataWriter.ts';

export default defineConfig({
  plugins: [react(), manhwaDataWriter()],
});
