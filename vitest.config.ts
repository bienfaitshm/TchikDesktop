import { defineConfig, mergeConfig } from "vitest/config";
import viteConfig from "./vite.config.ts";

/**
 * Defines and exports the merged Vitest configuration.
 * @returns The merged Vite and Vitest configuration object.
 */
export default defineConfig(() =>
  mergeConfig(viteConfig, {
    test: {
      globals: true,
      environment: "node",
      setupFiles: [],
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
