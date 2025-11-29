import devServer from "@hono/vite-dev-server";
import { defineConfig } from "vite";
import tsConfigPaths from "vite-tsconfig-paths";

export default defineConfig(() => {
  return {
    server: {
      host: "127.0.0.1",
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
