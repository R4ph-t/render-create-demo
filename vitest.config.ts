import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    testTimeout: 180000, // 3 minutes for scaffolding operations
    hookTimeout: 180000,
    fileParallelism: false, // Run test files sequentially
    sequence: {
      concurrent: false, // Run tests in each file sequentially
    },
  },
});
