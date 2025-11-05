import { defineConfig } from 'tsup'

export default defineConfig({
  entry: [
    'src/runtime/index.ts',
    'src/config/index.ts',
    'src/cli/index.ts',
    'src/plugin/index.ts',
    'src/plugin/vite/index.ts',
    'src/plugin/webpack/index.ts',
    'src/plugin/generic/index.ts',
    'src/plugin/generic/exec.ts',
  ],
  format: ['cjs', 'esm'],
  dts: true,
  treeshake: true,
})
