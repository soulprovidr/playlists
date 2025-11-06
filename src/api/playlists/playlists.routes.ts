import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import _ from "lodash";
import { z } from "zod";
import { authMiddleware } from "../middleware/auth";
import * as playlistsService from "./playlists.service";

const upsertPlaylistSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  sources: z.array(
    z.object({
      type: z.string(),
      config: z.record(z.any()),
    }),
  ),
});

export const playlistsRoutes = new Hono()
  .use(authMiddleware)
  .post("/", zValidator("json", upsertPlaylistSchema), async (c) => {
    const { id: userId } = c.var.user;
    const body = c.req.valid("json");

    try {
      const result = await playlistsService.upsertPlaylist(
        userId,
        undefined,
        body,
      );
      return c.json(result);
    } catch (error) {
      console.error("Failed to upsert playlist:", error);
      return c.json({ error: "Failed to save playlist" }, 500);
    }
  })
  .post(
    "/:playlistConfigId",
    zValidator("json", upsertPlaylistSchema),
    async (c) => {
      const { id: userId } = c.var.user;
      const playlistConfigId = _.toNumber(c.req.param("playlistConfigId"));
      const body = c.req.valid("json");

      try {
        const result = await playlistsService.upsertPlaylist(
          userId,
          playlistConfigId,
          body,
        );
        return c.json(result);
      } catch (error) {
        console.error("Failed to upsert playlist:", error);
        return c.json({ error: "Failed to save playlist" }, 500);
      }
    },
  )
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
