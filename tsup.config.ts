import { defineConfig } from 'tsup'

export default defineConfig([
  // Main library exports
  {
    entry: ['src/__exports'],
    format: ['cjs', 'esm'],
    dts: true,
    treeshake: true,
  },
  // CLI
  {
    entry: ['src/cli', 'src/codemods'],
    format: ['esm'],
    dts: false,
    treeshake: true,
    outDir: 'dist',
    platform: 'node',
    target: 'node16',
    esbuildOptions(options) {
      options.banner = {
        js: '#!/usr/bin/env node',
      }
    },
  },
])
