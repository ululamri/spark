import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { imagetools } from 'vite-imagetools';
import { defineConfig, type PluginOption } from 'vite';

const plugins: PluginOption[] = [tailwindcss()];

if (process.env.SPARK_ENABLE_IMAGETOOLS === 'true') {
  plugins.push(imagetools());
}

plugins.push(sveltekit());

export default defineConfig({
  plugins,
  server: {
    host: '0.0.0.0',
    port: 5000,
    allowedHosts: true
  }
});
