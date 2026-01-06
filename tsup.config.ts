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
    entry: [
      'src/cli/index.ts',
      'src/cli/commands/codemod.ts',
      'src/codemods/index.ts',
      'src/codemods/slash-to-dot.ts',
    ],
    format: ['esm'],
    dts: false,
    treeshake: false,
    outDir: 'dist',
    outExtension: () => ({ js: '.js' }),
    platform: 'node',
    target: 'node16',
    bundle: false,
    splitting: false,
    esbuildOptions(options) {
      options.banner = {
        js: '#!/usr/bin/env node',
      }
    },
  },
])
