import * as playlistSourcesRepo from "../playlist-sources/playlist-sources.repo";
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

export function updatePlaylistConfig(
  playlistConfigId: number,
  playlistConfig: PlaylistConfigUpdate,
): Promise<PlaylistConfig> {
  return playlistConfigsRepo.updatePlaylistConfig(
    playlistConfigId,
    playlistConfig,
  );
}

export function upsertPlaylistConfigBySpotifyId(
  playlistConfig: PlaylistConfigInsert,
): Promise<PlaylistConfig> {
  return playlistConfigsRepo.upsertPlaylistConfigBySpotifyId(playlistConfig);
}

export async function deletePlaylistConfigBySpotifyPlaylistId(
  spotifyPlaylistId: string,
) {
  const playlistConfig =
    await playlistConfigsRepo.getPlaylistConfigBySpotifyPlaylistId(
      spotifyPlaylistId,
    );
  if (!playlistConfig) return;
  await playlistSourcesRepo.deletePlaylistSourcesByPlaylistConfigId(
    playlistConfig.id,
  );
  await playlistConfigsRepo.deletePlaylistConfigById(playlistConfig.id);
}
