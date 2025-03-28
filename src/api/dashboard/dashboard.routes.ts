import * as playlistConfigsService from "@modules/playlist-configs/playlist-configs.service";
import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";

export const dashboardRoutes = new Hono()
  .use(authMiddleware)
  .get("/", async (c) => {
    const { spotifyUserId } = c.var.user;
    const playlistConfigs =
      await playlistConfigsService.getPlaylistConfigsBySpotifyUserId(
        spotifyUserId,
      );
    return c.json(playlistConfigs);
  });
