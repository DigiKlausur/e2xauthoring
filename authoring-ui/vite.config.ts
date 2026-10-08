import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig(() => ({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
      "@api": path.resolve(import.meta.dirname, "src/api"),
      "@domain": path.resolve(import.meta.dirname, "src/domain"),
      "@hooks": path.resolve(import.meta.dirname, "src/hooks"),
      "@components": path.resolve(import.meta.dirname, "src/components"),
      "@lib": path.resolve(import.meta.dirname, "src/lib"),
    },
  },
  build: {
    sourcemap: true,
    outDir: path.resolve(
      import.meta.dirname,
      "../e2xauthoring/app/static/authoring-ui",
    ),
    emptyOutDir: true,
    rollupOptions: {
      input: path.resolve(import.meta.dirname, "src/main.tsx"),
      output: {
        entryFileNames: "main.js",
        chunkFileNames: "chunks/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
  server: { port: 5174 },
}));
