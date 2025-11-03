import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/runtime/index.ts',
    'src/vite-plugin/index.ts',
    'src/config/index.ts',
    'src/cli/index.ts',
  ],
  format: ['cjs', 'esm'],
  dts: {
    resolve: true,
  },
  treeshake: true,
})
