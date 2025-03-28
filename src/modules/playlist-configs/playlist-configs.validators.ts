import { z } from "zod";

export enum PlaylistSourceType {
  REDDIT = "reddit",
}

const playlistSourceSchema = z.object({
  type: z.nativeEnum(PlaylistSourceType),
  url: z.string(),
});

const redditSourceSchema = playlistSourceSchema.extend({
  type: z.literal(PlaylistSourceType.REDDIT),
});

const playlistConfigSchema = z.object({
  name: z.string(),
  spotifyPlaylistId: z.string(),
  sources: z.array(redditSourceSchema),
});

export const playlistConfigFileSchema = z.array(playlistConfigSchema);

export type PlaylistConfig = z.infer<typeof playlistConfigSchema>;
