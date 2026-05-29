import { resolve } from "path";
import { defineConfig } from "electron-vite";
import react from "@vitejs/plugin-react";

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
      rollupOptions: {
        external: [
          "electron",
          "sqlite3",
          "pg",
          "pg-hstore",
          "mysql2",
          "tedious",
          "oracledb",
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
      },
    },
    plugins: [react()], // SWC est géré nativement par le plugin react
  },
});
