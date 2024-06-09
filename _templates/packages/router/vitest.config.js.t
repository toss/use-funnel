---
to: packages/<%= name %>/vitest.config.js
---
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    environment: 'jsdom',
  },
});
