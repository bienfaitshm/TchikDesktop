import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";

/**
 * Base Vite configuration module integrating path aliases and Tailwind CSS.
 * @see https://vitejs.dev/config/
 */
export default defineConfig({
  plugins: [tailwindcss()],
});
