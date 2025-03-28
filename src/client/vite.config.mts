import react from "@vitejs/plugin-react";
import * as path from "path";
import { defineConfig, UserConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(({ command }) => {
  const sharedConfig = {
    root: __dirname,
    plugins: [tsConfigPaths(), react()],
    publicDir: path.resolve(__dirname, "public"),
    resolve: {
      alias: {
        styles: path.resolve(__dirname, "scss"),
      },
    },
  } satisfies UserConfig;

  switch (command) {
    case "serve":
      return {
        ...sharedConfig,
        server: {
          open: true,
          port: 3001,
          proxy: {
            "/api": "http://localhost:3000",
          },
        },
      } satisfies UserConfig;
    case "build": {
      return {
        build: {
          ...sharedConfig,
          outDir: path.resolve(__dirname, "../../dist/client"),
          emptyOutDir: true,
        },
      } satisfies UserConfig;
    }
    default:
      return sharedConfig;
  }
});
