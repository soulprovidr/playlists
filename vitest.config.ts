import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    globals: true,
  },
  resolve: {
    alias: {
      "@config": resolve(__dirname, "./src/_config"),
      "@database": resolve(__dirname, "./src/_database"),
      "@env": resolve(__dirname, "./src/_env"),
      "@jobs": resolve(__dirname, "./src/_jobs"),
      "@lib": resolve(__dirname, "./src/lib"),
      "@logger": resolve(__dirname, "./src/_logger"),
      "@modules": resolve(__dirname, "./src/modules"),
      "@tasks": resolve(__dirname, "./src/tasks"),
    },
  },
});
