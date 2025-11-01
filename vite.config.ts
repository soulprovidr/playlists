import devServer from "@hono/vite-dev-server";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => {
  return {
    server: {
      port: 3000,
    },
    plugins: [
      tsConfigPaths(),
      devServer({
        entry: "src/_app.ts",
      }),
    ],
  };
});
