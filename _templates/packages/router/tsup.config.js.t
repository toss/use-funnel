---
to: packages/<%= name %>/tsup.config.js
---
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm'],
})
