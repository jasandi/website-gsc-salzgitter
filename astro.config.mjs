import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.gsc-salzgitter.de',
  output: 'static',
  build: {
    format: 'file'
  }
});
