import * as playlistConfigsRepo from "./playlist-configs.repo";
import type {
  PlaylistConfig,
  PlaylistConfigInsert,
  PlaylistConfigUpdate,
} from "./playlist-configs.types";

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

export const createPlaylistConfig = (
  playlistConfig: PlaylistConfigInsert,
): Promise<PlaylistConfig> => {
  return playlistConfigsRepo.createPlaylistConfig(playlistConfig);
};

export const updatePlaylistConfig = (
  playlistConfigId: number,
  playlistConfig: PlaylistConfigUpdate,
): Promise<PlaylistConfig> => {
  return playlistConfigsRepo.updatePlaylistConfig(
    playlistConfigId,
    playlistConfig,
  );
};
