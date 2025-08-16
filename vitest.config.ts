import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    include: ["**/test/**/*.test.ts"],
    exclude: ["/node_modules/", "/dist/"],
    coverage: {
      provider: "v8",
      reporter: ["text", "lcov", "html"],
      include: ["src/**/*.ts"],
      exclude: ["src/**/*.d.ts", "src/cli/index.ts"],
    },
    testTimeout: 10000,
    watch: false,
    reporters: ["verbose"],
    sequence: {
      setupFiles: "parallel",
    },
    setupFiles: [],
  },
  resolve: {
    conditions: ["import", "node"],
  },
});
