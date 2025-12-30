import * as playlistConfigsRepo from "./playlist-configs.repo";
import type {
  PlaylistConfig,
  PlaylistConfigInsert,
  PlaylistConfigUpdate,
} from "./playlist-configs.types";

export function getAllPlaylistConfigs(): Promise<PlaylistConfig[]> {
  return playlistConfigsRepo.getAllPlaylistConfigs();
}

export function getPlaylistConfigById(
  playlistConfigId: number,
): Promise<PlaylistConfig | undefined> {
  return playlistConfigsRepo.getPlaylistConfigById(playlistConfigId);
}

export function createPlaylistConfig(
  playlistConfig: PlaylistConfigInsert,
): Promise<PlaylistConfig> {
  return playlistConfigsRepo.createPlaylistConfig(playlistConfig);
}

export function updatePlaylistConfig(
  playlistConfigId: number,
  playlistConfig: PlaylistConfigUpdate,
): Promise<PlaylistConfig> {
  return playlistConfigsRepo.updatePlaylistConfig(
    playlistConfigId,
    playlistConfig,
  );
}

export function getPlaylistConfigBySpotifyPlaylistId(
  spotifyPlaylistId: string,
): Promise<PlaylistConfig | undefined> {
  return playlistConfigsRepo.getPlaylistConfigBySpotifyPlaylistId(
    spotifyPlaylistId,
  );
}

export function upsertPlaylistConfigBySpotifyId(
  playlistConfig: PlaylistConfigInsert,
): Promise<PlaylistConfig> {
  return playlistConfigsRepo.upsertPlaylistConfigBySpotifyId(playlistConfig);
}
