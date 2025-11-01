import { Hono } from "hono";
import _ from "lodash";
import { authMiddleware } from "../middleware/auth";
import * as playlistsService from "./playlists.service";

export const playlistsRoutes = new Hono()
  .use(authMiddleware)
  .get("/:playlistConfigId", async (c) => {
    const { id: userId } = c.var.user;
    const playlistConfigId = _.toNumber(c.req.param("playlistConfigId"));
    const playlistView =
      await playlistsService.getPlaylistView(playlistConfigId);

    if (playlistView?.userId !== userId) {
      return c.json({ error: "Unauthorized" }, 403);
    }

    if (!playlistView) {
      return c.json({ error: "Playlist not found" }, 404);
    }

    return c.json(playlistView);
  })
  .post("/:playlistConfigId/build", async (c) => {
    const playlistConfigId = _.toNumber(c.req.param("playlistConfigId"));
    try {
      await playlistsService.buildPlaylistByPlaylistConfigId(playlistConfigId);
      return c.json({ success: true });
    } catch {
      return c.json({ error: "Failed to build playlist" }, 500);
    }
  });
