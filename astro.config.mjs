import { defineConfig } from 'astro/config';

// Documentation pointer to the fixture the loader imports. v0.2 will
// replace the file at this path (or symlink it to the real GridSilicon
// export); src/lib/load-projects.ts imports it statically by relative
// path so Vite bundles it deterministically.
export const DATA_SOURCE = './src/data/ercot.fixture.json';

export default defineConfig({
  site: 'https://siteatlas.example',
  build: {
    format: 'directory'
  }
});
