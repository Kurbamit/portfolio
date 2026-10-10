import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import content from "./src/content/vite-plugin.js";

// https://vite.dev/config/
export default defineConfig({
  base: "/portfolio/",
  plugins: [react(), tailwindcss(), content()],
  test: { environment: "node" },
});
