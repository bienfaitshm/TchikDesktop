import { resolve } from "path";
import { defineConfig, swcPlugin } from "electron-vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig({
  main: {
    oxc: false,
    resolve: {
      alias: {
        "@/main": resolve("src/main"),
        "@/packages": resolve("src/packages"),
      },
    },
    plugins: [
      swcPlugin({
        // Doit correspondre STRICTEMENT à l'interface SwcOptions
        transformOptions: {
          // Doit correspondre STRICTEMENT à l'interface TransformConfig de @swc/core
          legacyDecorator: true, // Active la transformation des décorateurs (ex: TypeORM/Drizzle)
          decoratorMetadata: true, // Génère les métadonnées de réflexion pour TypeScript
          react: {
            runtime: "automatic", // Utilise le JSX transform moderne (React 17+)
          },
        },
      }),
    ],
    build: {
      externalizeDeps: true, // Laisse sqlite3 et electron à l'extérieur du bundle
    },
  },

  preload: {
    oxc: false,
    build: {
      externalizeDeps: true,
    },
    plugins: [swcPlugin()],
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
