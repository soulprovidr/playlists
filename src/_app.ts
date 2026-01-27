import { getSpotifyUserId } from "@config";
import { env } from "@env";
import { serve } from "@hono/node-server";
import { logger } from "@logger";
import * as spotifyAccessTokenService from "@modules/spotify/spotify-access-tokens/spotify-access-tokens.service";
import { seedPlaylists } from "@tasks/seed-playlists";
import { Hono } from "hono";
import { secureHeaders } from "hono/secure-headers";
import { appRoutes } from "./app/app.routes";
import { initializeScheduler } from "./tasks/schedule-playlists";

const app = new Hono();

// Middleware.
app.use(async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(`${c.req.method} ${c.req.path} ${c.res.status} - ${ms}ms`);
});
app.use(secureHeaders());

app.route("/", appRoutes);

// Startup tasks.
await seedPlaylists();

// Authorize Spotify user (if necessary), then schedule playlists.
const spotifyUserId = getSpotifyUserId();
const spotifyAccessToken =
  await spotifyAccessTokenService.getSpotifyAccessTokenBySpotifyUserId(
    spotifyUserId,
  );
if (!spotifyAccessToken) {
  logger.info(`Login with Spotify to begin: ${env.SERVER_HOST}/authorize`);
} else {
  initializeScheduler();
}

serve({ fetch: app.fetch, port: env.PORT });
