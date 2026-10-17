import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

/**
 * Base Vite configuration module integrating path aliases and Tailwind CSS.
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  plugins: [tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
