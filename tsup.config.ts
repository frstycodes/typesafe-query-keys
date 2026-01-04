import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/__exports'],
  format: ['cjs', 'esm'],
  dts: true,
  treeshake: true,
})
