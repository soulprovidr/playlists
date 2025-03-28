import playlistConfigs from "../../../data/playlist-configs.json";
import { PlaylistConfig } from "./playlist-configs.types";

export const getPlaylistConfigsBySpotifyUserId = async (
  spotifyUserId: string,
): Promise<PlaylistConfig[] | undefined> => {
  return playlistConfigs.filter(
    (config) => config.spotifyUserId === spotifyUserId,
  );
};

export const getPlaylistConfigBySpotifyPlaylistId = async (
  spotifyUserId: string,
  spotifyPlaylistId: string,
): Promise<PlaylistConfig | undefined> => {
  return playlistConfigs.find(
    (config) =>
      config.spotifyUserId === spotifyUserId &&
      config.spotifyPlaylistId === spotifyPlaylistId,
  );
};
