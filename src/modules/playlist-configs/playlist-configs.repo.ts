import { database } from "@database";
import {
  PlaylistConfig,
  PlaylistConfigInsert,
  PlaylistConfigUpdate,
} from "./playlist-configs.types";

export const getPlaylistConfigById = async (
  playlistConfigId: number,
): Promise<PlaylistConfig | undefined> => {
  return database
    .selectFrom("playlistConfigs")
    .where("id", "=", playlistConfigId)
    .selectAll()
    .executeTakeFirst();
};

export const getPlaylistConfigsByUserId = async (
  userId: number,
): Promise<PlaylistConfig[]> => {
  return database
    .selectFrom("playlistConfigs")
    .where("userId", "=", userId)
    .selectAll()
    .execute();
};

export const createPlaylistConfig = async (
  playlistConfig: PlaylistConfigInsert,
): Promise<PlaylistConfig> => {
  const result = await database
    .insertInto("playlistConfigs")
    .values(playlistConfig)
    .returningAll()
    .executeTakeFirstOrThrow();
  return result;
};

export const updatePlaylistConfig = async (
  playlistConfigId: number,
  playlistConfig: PlaylistConfigUpdate,
): Promise<PlaylistConfig> => {
  const result = await database
    .updateTable("playlistConfigs")
    .set(playlistConfig)
    .where("id", "=", playlistConfigId)
    .returningAll()
    .executeTakeFirstOrThrow();
  return result;
};
