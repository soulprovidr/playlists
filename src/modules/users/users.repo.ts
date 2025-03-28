import { database } from "@database";
import { User, UserInsert } from "./users.types";

export const insertUser = async (user: UserInsert): Promise<number> => {
  const [result] = await database.insertInto("users").values(user).execute();
  return Number(result.insertId);
};

export const getUserById = async (
  userId: number,
): Promise<User | undefined> => {
  return database
    .selectFrom("users")
    .where("id", "=", userId)
    .selectAll()
    .executeTakeFirst();
};

export const getUserBySpotifyUserId = async (
  spotifyUserId: string,
): Promise<User | undefined> => {
  return database
    .selectFrom("users")
    .where("spotify_user_id", "=", spotifyUserId)
    .selectAll()
    .executeTakeFirst();
};
