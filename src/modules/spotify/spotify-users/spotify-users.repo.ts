import { database } from "@database";
import {
  SpotifyUser,
  SpotifyUserInsert,
  SpotifyUserUpdate,
} from "./spotify-users.types";

export const getSpotifyUserBySpotifyId = async (
  spotifyUserId: string,
): Promise<SpotifyUser | undefined> => {
  return database
    .selectFrom("spotifyUsers")
    .where("spotifyUserId", "=", spotifyUserId)
    .selectAll()
    .executeTakeFirst();
};

export const insertSpotifyUser = async (
  user: SpotifyUserInsert,
): Promise<number> => {
  const [result] = await database
    .insertInto("spotifyUsers")
    .values(user)
    .execute();
  return Number(result.insertId);
};

export const updateSpotifyUserBySpotifyId = async (
  spotifyUserId: string,
  user: SpotifyUserUpdate,
): Promise<void> => {
  await database
    .updateTable("spotifyUsers")
    .set(user)
    .where("spotifyUserId", "=", spotifyUserId)
    .executeTakeFirst();
};
