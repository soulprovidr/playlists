import { PlaylistViewResponse } from "@api/playlists/playlists.types";
import { BuildCadence } from "@modules/playlist-configs/playlist-configs.types";
import {
  PlaylistSourceType,
  RedditSourceConfig,
  RssSourceConfig,
} from "@modules/playlist-sources/playlist-sources.types";

export const getSpotifyPlaylistUrl = (playlistId: string): string => {
  return `https://open.spotify.com/playlist/${playlistId}`;
};

export const getSourceTypeLabel = (type: PlaylistSourceType): string => {
  switch (type) {
    case PlaylistSourceType.REDDIT:
      return "Reddit";
    case PlaylistSourceType.RSS:
      return "RSS";
    default:
      return type;
  }
};

export const getSourceDetails = (
  source: PlaylistViewResponse["sources"][0],
): string => {
  if (source.type === PlaylistSourceType.REDDIT) {
    const config = source.config as RedditSourceConfig;
    return `r/${config.value}`;
  }
  if (source.type === PlaylistSourceType.RSS) {
    const config = source.config as RssSourceConfig;
    return config.feedUrl;
  }
  return "Unknown";
};

export const getScheduleCadenceLabel = (
  buildCadence: BuildCadence,
  buildDay: string | null,
): string => {
  if (buildCadence === BuildCadence.WEEKLY) {
    if (buildDay) {
      const dayName = buildDay.charAt(0) + buildDay.slice(1).toLowerCase();
      return `${dayName}s`;
    }
    return "Repeats weekly";
  }

  return "No schedule";
};
