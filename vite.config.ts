import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// GitHub Pages configuration
// Repository name for GitHub Pages subdirectory
const repoName = "Royal-Light-StudyGapAI";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Use subdirectory base path for production builds (GitHub Pages)
  // Use root path for development
  const base = mode === "production" ? `/${repoName}/` : "/";

  return {
    base: base,
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      outDir: "dist",
      assetsDir: "assets",
      sourcemap: false, // Disable sourcemaps for faster builds (enable if needed for debugging)
    },
  };
});

