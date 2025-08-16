import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { typesafeQueryKeysPlugin } from '@frsty/typesafe-query-keys/vite-plugin'

export default defineConfig({
  plugins: [
    react(),
    typesafeQueryKeysPlugin({
      include: ['src/**/*.{ts,tsx}', 'test/**/*.{ts,tsx}'],
      outputFile: 'src/queryKeys.gen.d.ts',
      ignoreFile: '.gitignore',
      verbose: true,
    }),
  ],
})
