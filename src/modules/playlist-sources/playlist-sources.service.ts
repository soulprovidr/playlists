import * as playlistSourcesRepo from "./playlist-sources.repo";
import { PlaylistSource, PlaylistSourceInsert } from "./playlist-sources.types";

export const getPlaylistSourcesByPlaylistConfigIds = (
  playlistConfigIds: number[],
): Promise<PlaylistSource[]> => {
  return playlistSourcesRepo.getPlaylistSourcesByPlaylistConfigIds(
    playlistConfigIds,
  );
};

export const createPlaylistSource = (
  playlistSource: PlaylistSourceInsert,
): Promise<PlaylistSource> => {
  return playlistSourcesRepo.createPlaylistSource(playlistSource);
};

export const deletePlaylistSource = (
  playlistSourceId: number,
): Promise<void> => {
  return playlistSourcesRepo.deletePlaylistSource(playlistSourceId);
};

export const deletePlaylistSourcesByPlaylistConfigId = (
  playlistConfigId: number,
): Promise<void> => {
  return playlistSourcesRepo.deletePlaylistSourcesByPlaylistConfigId(
    playlistConfigId,
  );
};
