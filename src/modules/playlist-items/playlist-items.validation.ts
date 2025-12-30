import { z } from "zod";

export const albumValidator = z.object({
  artist: z.string(),
  album: z.string(),
});

export const trackValidator = z.object({
  artist: z.string(),
  title: z.string(),
});

export type PlaylistItem = z.infer<
  typeof albumValidator | typeof trackValidator
>;
