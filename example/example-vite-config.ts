import { defineConfig } from "vite";
import { typesafeQueryKeysPlugin } from "../src/vite-plugin";

export default defineConfig({
  plugins: [
    typesafeQueryKeysPlugin({
      include: ["src/**/*.{ts,tsx}"],
      outputFile: "src/query-keys.gen.ts",
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/*.test.{ts,tsx}",
        "**/*.spec.{ts,tsx}",
        "**/generated/**",
      ],
      ignoreFile: ".gitignore",
    }),
  ],
});
