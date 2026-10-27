import solid from "vite-plugin-solid";
import { defineConfig } from "vitest/config";

export default defineConfig({
  // Hot reloading only matters in a dev server, and breaks module loading under vitest.
  plugins: [solid({ hot: false })],
  test: {
    environment: "jsdom",
    // Reuses one jsdom per worker while keeping each test file isolated; about twice as fast.
    pool: "vmThreads",
    setupFiles: ["./test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}", "test/**/*.test.{ts,tsx}"],
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/icons/**", "src/**/*.test.{ts,tsx}", "src/index.tsx"],
      // json-summary feeds scripts/coverage-badge.mjs.
      reporter: ["text-summary", "lcov", "json-summary"],
      // A floor just under the current numbers, so coverage can only go up.
      thresholds: { lines: 84, statements: 80, functions: 86, branches: 67 }
    }
  }
});
