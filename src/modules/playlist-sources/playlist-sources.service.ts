import * as playlistSourcesRepo from "./playlist-sources.repo";
import { PlaylistSource } from "./playlist-sources.types";

export const getPlaylistSourcesByPlaylistConfigIds = (
  playlistConfigIds: number[],
): Promise<PlaylistSource[]> => {
  return playlistSourcesRepo.getPlaylistSourcesByPlaylistConfigIds(
    playlistConfigIds,
  );
};
