import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config";

/**
 * Vitest configuration module merging base Vite settings with test execution rules,
 * Node environment setup, and strict V8 coverage thresholds.
 * @see https://vitest.dev/config/
 */
export default defineConfig(() =>
  mergeConfig(viteConfig, {
    test: {
      /** Enables global test APIs (describe, it, expect) without explicit imports. */
      globals: true,

      /** Sets the execution environment for backend services without DOM dependencies. */
      environment: "node",

      /** Files to execute before each test suite for global mocks and setup. */
      setupFiles: [],

      /** Code coverage configuration enforcing minimum quality thresholds via V8. */
      coverage: {
        enabled: true,
        provider: "v8",
        reporter: ["text", "json", "html"],
        thresholds: {
          statements: 80,
          branches: 80,
          functions: 80,
          lines: 80,
        },
        exclude: [
          "node_modules/",
          "dist/",
          "coverage/",
          "**/__tests__/",
          "**/vitest.setup.ts",
        ],
        include: ["src/**/*.ts", "src/**/*.tsx"],
      },
    },
  }),
);
