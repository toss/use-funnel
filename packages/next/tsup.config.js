import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/compat.tsx'],
  format: ['esm'],
});
