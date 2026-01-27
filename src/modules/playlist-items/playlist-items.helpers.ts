import _ from "lodash";
import { PlaylistItem } from "./playlist-items.validation";

/**
 * Deduplicates playlist items by artist and name (case-insensitive)
 */
export function dedupePlaylistItems(
  playlistItems: PlaylistItem[],
): PlaylistItem[] {
  return _.uniqBy(
    playlistItems,
    (item) => `${item.artist.toLowerCase()}-${item.name.toLowerCase()}`,
  );
}
