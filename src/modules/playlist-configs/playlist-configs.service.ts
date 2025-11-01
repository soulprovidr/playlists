import * as playlistConfigsRepo from "./playlist-configs.repo";
import type { PlaylistConfig } from "./playlist-configs.types";

export const getPlaylistConfigsByUserId = async (
  userId: number,
): Promise<PlaylistConfig[]> => {
  return playlistConfigsRepo.getPlaylistConfigsByUserId(userId);
};

export const getPlaylistConfigById = (
  playlistConfigId: number,
): Promise<PlaylistConfig | undefined> => {
  return playlistConfigsRepo.getPlaylistConfigById(playlistConfigId);
};
