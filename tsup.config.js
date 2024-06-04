import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/adapters/state.ts', 'src/adapters/reactRouter6.ts'],
  format: ['esm'],
})