import { database } from "@database";
import {
  SpotifyAccessToken,
  SpotifyAccessTokenInsert,
  SpotifyAccessTokenUpdate,
} from "./spotify-access-tokens.types";

export const getSpotifyAccessTokenByUserId = async (
  userId: number,
): Promise<SpotifyAccessToken | undefined> => {
  return database
    .selectFrom("spotifyAccessTokens")
    .where("userId", "=", userId)
    .selectAll()
    .executeTakeFirst();
};

export const insertSpotifyAccessToken = async (
  spotifyAccessTokenInsert: SpotifyAccessTokenInsert,
): Promise<number> => {
  const [result] = await database
    .insertInto("spotifyAccessTokens")
    .values(spotifyAccessTokenInsert)
    .execute();
  return Number(result.insertId);
};

export const updateSpotifyAccessTokenByUserId = async (
  userId: number,
  spotifyAccessTokenUpdate: SpotifyAccessTokenUpdate,
): Promise<void> => {
  await database
    .updateTable("spotifyAccessTokens")
    .set(spotifyAccessTokenUpdate)
    .where("userId", "=", userId)
    .executeTakeFirst();
};
