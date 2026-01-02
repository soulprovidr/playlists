import { z } from "zod";

export const albumValidator = z.object({
  artist: z.string(),
  album: z.string(),
});

export const trackValidator = z.object({
  artist: z.string(),
  title: z.string(),
});

export type Album = z.infer<typeof albumValidator>;
export type Track = z.infer<typeof trackValidator>;

export type PlaylistItem = {
  artist: string;
  name: string;
};

/**
 * Normalizes an album to a PlaylistItem with a common `name` field
 */
export function albumToPlaylistItem(album: Album): PlaylistItem {
  return {
    artist: album.artist,
    name: album.album,
  };
}

/**
 * Normalizes a track to a PlaylistItem with a common `name` field
 */
export function trackToPlaylistItem(track: Track): PlaylistItem {
  return {
    artist: track.artist,
    name: track.title,
  };
}
