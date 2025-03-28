import * as playlistConfigsService from "@modules/playlist-configs/playlist-configs.service";
import { buildPlaylist } from "@tasks/build-playlist";
import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";

export const playlistsRoutes = new Hono()
  .use(authMiddleware)
  .get("/:spotifyPlaylistId", async (c) => {
    const { spotifyUserId } = c.var.user;
    const spotifyPlaylistId = c.req.param("spotifyPlaylistId");
    const playlistConfig =
      await playlistConfigsService.getPlaylistConfigBySpotifyPlaylistId(
        spotifyUserId,
        spotifyPlaylistId,
      );

    if (!playlistConfig) {
      return c.json({ error: "Playlist not found" }, 404);
    }

    return c.json(playlistConfig);
  })
  .post("/:spotifyPlaylistId/generate", async (c) => {
    const { spotifyUserId } = c.var.user;
    const spotifyPlaylistId = c.req.param("spotifyPlaylistId");
    const playlistConfig =
      await playlistConfigsService.getPlaylistConfigBySpotifyPlaylistId(
        spotifyUserId,
        spotifyPlaylistId,
      );

    if (!playlistConfig) {
      return c.json({ error: "Playlist not found" }, 404);
    }

    await buildPlaylist(playlistConfig);

    return c.json({ success: true });
  });
