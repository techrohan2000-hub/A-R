import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// base: "./" makes the production build use relative asset paths, so it
// works out of the box on GitHub Pages at username.github.io/repo-name/
// without needing to know the repo name ahead of time. Combined with
// HashRouter for routing, no extra GitHub Pages SPA rewrite trick is needed.
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
});
