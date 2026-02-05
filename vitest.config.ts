import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    globalSetup: "./tests/setup.ts",
    testTimeout: 180000, // 3 minutes for scaffolding operations
    hookTimeout: 180000,
    fileParallelism: false, // Run test files sequentially
    sequence: {
      concurrent: false, // Run tests in each file sequentially
    },
  },
});
