// import { resolve } from "path";
// import { defineConfig, externalizeDepsPlugin } from "electron-vite";
// import react from "@vitejs/plugin-react";

// export default defineConfig({
//   main: {
//     resolve: {
//       alias: {
//         "@/main": resolve("src/main"),
//         "@/packages": resolve("src/packages"),
//         "@/commons": resolve("src/commons"),
//       },
//     },
//     plugins: [externalizeDepsPlugin()],
//   },
//   preload: {
//     plugins: [externalizeDepsPlugin()],
//   },
//   renderer: {
//     resolve: {
//       alias: {
//         "@/renderer": resolve("src/renderer"),
//         "@/packages": resolve("src/packages"),
//         "@/commons": resolve("src/commons"),
//       },
//     },
//     plugins: [react()],
//   },
// });

import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
// import { nodePolyfills } from "vite-plugin-node-polyfills";

export default defineConfig({
  main: {
    resolve: {
      alias: {
        "@/main": resolve("src/main"),
        "@/packages": resolve("src/packages"),
        "@/commons": resolve("src/commons"),
      },
    },
    plugins: [
      externalizeDepsPlugin({
        // Très important : on dit à Electron-Vite de ne PAS toucher à sqlite3
        // car c'est un module natif qui doit être chargé via Node.js directement.
        exclude: ["sqlite3", "pg-hstore"],
      }),
    ],
    build: {
      rollupOptions: {
        // On ignore les drivers que Sequelize cherche par défaut mais qu'on n'utilise pas
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
        "@/commons": resolve("src/commons"),
      },
    },
    plugins: [
      react(),
      // // Règle l'erreur "Buffer is not defined" dans la console du navigateur
      // nodePolyfills({
      //   globals: {
      //     Buffer: true,
      //     process: true,
      //   },
      // }),
    ],
  },
});
