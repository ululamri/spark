import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { imagetools } from 'vite-imagetools';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [tailwindcss(), imagetools(), sveltekit()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true
  }
});
