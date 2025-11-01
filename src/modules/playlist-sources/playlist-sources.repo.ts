import { database } from "@database";
import { PlaylistSource } from "./playlist-sources.types";

export const getPlaylistSourcesByPlaylistConfigIds = (
  playlistConfigIds: number[],
): Promise<PlaylistSource[]> => {
  return database
    .selectFrom("playlistSources")
    .selectAll("playlistSources")
    .where("playlistConfigId", "in", playlistConfigIds)
    .execute();
};
