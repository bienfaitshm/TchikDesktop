import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  main: {
    resolve: {
      alias: {
        "@/main": resolve("src/main"),
        "@/camons": resolve("src/camons"),
      },
    },
    plugins: [externalizeDepsPlugin()],
  },
  preload: {
    plugins: [externalizeDepsPlugin()],
  },
  renderer: {
    resolve: {
      alias: {
        "@/renderer": resolve("src/renderer"),
        "@/camons": resolve("src/camons"),
      },
    },
    plugins: [react()],
  },
});
