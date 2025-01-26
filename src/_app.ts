import { cli } from "@app/cli";
import * as spotify from "@app/spotify";
import { playlistConfigFileSchema } from "@app/validators";
import { env } from "@env";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import playlistConfigs from "../data/playlists.json";

try {
  playlistConfigFileSchema.parse(playlistConfigs);
} catch (e) {
  console.error(e);
  process.exit(1);
}

const router = new Hono();

router.get("/", async (c) => {
  return c.text("Hello, world!");
});

router.get("/authorize/spotify", async (c) => {
  const code = c.req.query("code");
  try {
    await spotify.handleUserAuthCode(code);
    cli.start();
    return c.text("Spotify authorized!");
  } catch (e) {
    console.error(e);
    return c.text((e as Error).message, 500);
  }
});

spotify.authorizeUser();

serve({
  fetch: router.fetch,
  port: env.SERVER_PORT,
});
