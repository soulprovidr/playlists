import * as playlistConfigsRepo from "./playlist-configs.repo";
import type { PlaylistConfig } from "./playlist-configs.types";

export const getPlaylistConfigsBySpotifyUserId = async (
  spotifyUserId: string,
): Promise<PlaylistConfig[] | undefined> => {
  return playlistConfigsRepo.getPlaylistConfigsBySpotifyUserId(spotifyUserId);
};

export const getPlaylistConfigBySpotifyPlaylistId = async (
  spotifyUserId: string,
  spotifyPlaylistId: string,
): Promise<PlaylistConfig | undefined> => {
  return playlistConfigsRepo.getPlaylistConfigBySpotifyPlaylistId(
    spotifyUserId,
    spotifyPlaylistId,
  );
};
