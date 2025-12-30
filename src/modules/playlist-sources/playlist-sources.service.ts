import * as playlistSourcesRepo from "./playlist-sources.repo";
import { PlaylistSource, PlaylistSourceInsert } from "./playlist-sources.types";

export function getPlaylistSourcesByPlaylistConfigIds(
  playlistConfigIds: number[],
): Promise<PlaylistSource[]> {
  return playlistSourcesRepo.getPlaylistSourcesByPlaylistConfigIds(
    playlistConfigIds,
  );
}

export function createPlaylistSource(
  playlistSource: PlaylistSourceInsert,
): Promise<PlaylistSource> {
  return playlistSourcesRepo.createPlaylistSource(playlistSource);
}

export function deletePlaylistSource(playlistSourceId: number): Promise<void> {
  return playlistSourcesRepo.deletePlaylistSource(playlistSourceId);
}

export function deletePlaylistSourcesByPlaylistConfigId(
  playlistConfigId: number,
): Promise<void> {
  return playlistSourcesRepo.deletePlaylistSourcesByPlaylistConfigId(
    playlistConfigId,
  );
}
