import { defineConfig } from '@frsty/typesafe-query-keys/config'

export default defineConfig({
  include: ['./src/**/*.{ts,tsx}', 'test/**/*.{ts,tsx}'],
  outputFile: 'src/queryKeys.gen.d.ts',
  ignoreFile: '.gitignore',
  verbose: true,
})
