import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
    exclude: ["**/node_modules/**", "**/dist/**", "**/examples/**"],
    coverage: {
      reporter: ["text", "json", "html", "lcov"],
      exclude: [
        "**/node_modules/**",
        "**/dist/**",
        "**/tests/**",
        "**/examples/**",
        "vitest.config.ts",
        "**/coverage/**",
      ],
      reportsDirectory: "./coverage",
      all: true,
      provider: "v8",
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 80,
        statements: 60,
      },
    },
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
