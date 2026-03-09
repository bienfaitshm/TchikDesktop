import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  main: {
    resolve: {
      alias: {
        "@/main": resolve("src/main"),
        "@/packages": resolve("src/packages"),
      },
    },
    plugins: [
      externalizeDepsPlugin({
        exclude: ["sqlite3", "pg-hstore"],
      }),
    ],
    build: {
      rollupOptions: {
        external: ["pg", "pg-hstore", "mysql2", "tedious", "oracledb"],
      },
    },
  },

  preload: {
    plugins: [externalizeDepsPlugin()],
  },

  renderer: {
    resolve: {
      alias: {
        "@/renderer": resolve("src/renderer"),
        "@/packages": resolve("src/packages"),
      },
    },
    plugins: [react()],
  },
});
