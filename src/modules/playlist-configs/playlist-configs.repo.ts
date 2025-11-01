import { database } from "@database";
import { PlaylistConfig } from "./playlist-configs.types";

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
