import { resolve } from "path";
import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";
import { visualizer } from "rollup-plugin-visualizer";

export default defineConfig({
  main: {
    oxc: false,
    resolve: {
      alias: {
        "@/main": resolve("src/main"),
        "@/packages": resolve("src/packages"),
      },
    },
    build: {
      externalizeDeps: true,
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: false,
        },
      },
      rollupOptions: {
        external: [
          "electron",
          "usb",
          "@node-escpos/core",
          "@node-escpos/usb-adapter",
          "sqlite3",
          "better-sqlite3",
          "pg",
          "pg-hstore",
          "mysql2",
          "tedious",
          "oracledb",
          "@libsql/client",
          /^@libsql\/.+/,
        ],
        plugins: [
          // Visualizer pour le processus principal
          visualizer({
            filename: "stats/main.html",
            template: "treemap",
          }),
        ],
      },
    },
  },

  preload: {
    build: {
      externalizeDeps: true,
    },
  },

  renderer: {
    resolve: {
      alias: {
        "@/renderer": resolve("src/renderer"),
        "@/packages": resolve("src/packages"),
        "@/components": resolve("src/renderer/components"),
      },
    },
    plugins: [react()],
  },
});
