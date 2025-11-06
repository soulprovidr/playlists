import { database } from "@database";
import { PlaylistSource, PlaylistSourceInsert } from "./playlist-sources.types";

export const getPlaylistSourcesByPlaylistConfigIds = (
  playlistConfigIds: number[],
): Promise<PlaylistSource[]> => {
  return database
    .selectFrom("playlistSources")
    .selectAll("playlistSources")
    .where("playlistConfigId", "in", playlistConfigIds)
    .execute();
};

export const createPlaylistSource = async (
  playlistSource: PlaylistSourceInsert,
): Promise<PlaylistSource> => {
  const result = await database
    .insertInto("playlistSources")
    .values(playlistSource)
    .returningAll()
    .executeTakeFirstOrThrow();
  return result;
};

export const deletePlaylistSource = async (
  playlistSourceId: number,
): Promise<void> => {
  await database
    .deleteFrom("playlistSources")
    .where("id", "=", playlistSourceId)
    .execute();
};

export const deletePlaylistSourcesByPlaylistConfigId = async (
  playlistConfigId: number,
): Promise<void> => {
  await database
    .deleteFrom("playlistSources")
    .where("playlistConfigId", "=", playlistConfigId)
    .execute();
};
