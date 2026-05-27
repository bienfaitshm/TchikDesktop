import { resolve } from "path";
import { defineConfig, swcPlugin } from "electron-vite";
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
      swcPlugin(), // Conserve SWC pour compiler le TypeScript rapidement
    ],
    build: {
      // 1. Remplacement moderne de externalizeDepsPlugin() pour le Main
      externalizeDeps: true,

      rollupOptions: {
        // 2. On déclare TOUS les modules de base de données comme externes.
        // Electron ira les chercher directement dans node_modules sans essayer de les compiler.
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
    // 3. Remplacement moderne de externalizeDepsPlugin() pour le Preload
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
    plugins: [react()],
  },
});
