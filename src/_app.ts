import { cli } from "@app/cli";
import { authorize, spotifyApi } from "@app/spotify";
import { playlistConfigFileSchema } from "@app/validators";
import { env } from "@env";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import playlistConfigs from "../data/playlists.json";

try {
  playlistConfigFileSchema.parse(playlistConfigs);
} catch (error) {
  console.error("Invalid playlist config.");
  console.error(error);
  process.exit(1);
}

const app = new Hono();

app.get("/", async (c) => {
  return c.text("Hello, world!");
});

app.get("/authorize/spotify", async (c) => {
  const code = c.req.query("code");
  try {
    await authorize(code);
    cli.start();
    return c.text("Spotify authorized!");
  } catch (e) {
    console.error(e);
    return c.text((e as Error).message, 500);
  }
});

console.log(`
  Authorize Spotify at:
  ${spotifyApi.createAuthorizeURL(
    ["playlist-modify-public", "playlist-modify-private"],
    "state",
  )}
`);

serve({
  fetch: app.fetch,
  port: env.SERVER_PORT,
});
