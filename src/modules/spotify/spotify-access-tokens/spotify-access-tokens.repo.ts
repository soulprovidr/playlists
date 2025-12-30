import { database } from "@database";
import {
  SpotifyAccessToken,
  SpotifyAccessTokenInsert,
  SpotifyAccessTokenUpdate,
} from "./spotify-access-tokens.types";

export async function getSpotifyAccessTokenBySpotifyUserId(
  spotifyUserId: string,
): Promise<SpotifyAccessToken | undefined> {
  return database
    .selectFrom("spotifyAccessTokens")
    .where("spotifyUserId", "=", spotifyUserId)
    .selectAll()
    .executeTakeFirst();
}

export async function insertSpotifyAccessToken(
  spotifyAccessTokenInsert: SpotifyAccessTokenInsert,
): Promise<number> {
  const [result] = await database
    .insertInto("spotifyAccessTokens")
    .values(spotifyAccessTokenInsert)
    .execute();
  return Number(result.insertId);
}

export async function updateSpotifyAccessTokenBySpotifyUserId(
  spotifyUserId: string,
  spotifyAccessTokenUpdate: SpotifyAccessTokenUpdate,
): Promise<void> {
  await database
    .updateTable("spotifyAccessTokens")
    .set(spotifyAccessTokenUpdate)
    .where("spotifyUserId", "=", spotifyUserId)
    .executeTakeFirst();
}
