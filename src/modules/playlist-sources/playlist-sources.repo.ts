import { database } from "@database";
import { PlaylistSource, PlaylistSourceInsert } from "./playlist-sources.types";

export function getPlaylistSourcesByPlaylistConfigIds(
  playlistConfigIds: number[],
): Promise<PlaylistSource[]> {
  return database
    .selectFrom("playlistSources")
    .selectAll("playlistSources")
    .where("playlistConfigId", "in", playlistConfigIds)
    .execute();
}

export async function createPlaylistSource(
  playlistSource: PlaylistSourceInsert,
): Promise<PlaylistSource> {
  const result = await database
    .insertInto("playlistSources")
    .values(playlistSource)
    .returningAll()
    .executeTakeFirstOrThrow();
  return result;
}

export async function deletePlaylistSource(
  playlistSourceId: number,
): Promise<void> {
  await database
    .deleteFrom("playlistSources")
    .where("id", "=", playlistSourceId)
    .execute();
}

export async function deletePlaylistSourcesByPlaylistConfigId(
  playlistConfigId: number,
): Promise<void> {
  await database
    .deleteFrom("playlistSources")
    .where("playlistConfigId", "=", playlistConfigId)
    .execute();
}
