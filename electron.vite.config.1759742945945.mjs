// electron.vite.config.ts
import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";
var electron_vite_config_default = defineConfig({
  main: {
    resolve: {
      alias: {
        "@/main": resolve("src/main"),
        "@/commons": resolve("src/commons")
      }
    },
    plugins: [externalizeDepsPlugin()]
  },
  preload: {
    plugins: [externalizeDepsPlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        "@/renderer": resolve("src/renderer"),
        "@/commons": resolve("src/commons")
      }
    },
    plugins: [react()]
  }
});
export {
  electron_vite_config_default as default
};
