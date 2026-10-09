import { defineConfig } from 'vite';

// GitHub Pages serves the game from /what-the-tide-keeps/; everywhere else it is served from the root.
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/what-the-tide-keeps/' : '/',
});
