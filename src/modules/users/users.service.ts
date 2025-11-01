import * as usersRepo from "./users.repo";
import { User, UserInsert } from "./users.types";

export const insertUser = (user: UserInsert): Promise<number> => {
  return usersRepo.insertUser(user);
};

export const getAllUsers = async (): Promise<User[]> => {
  return usersRepo.getAllUsers();
};

export const getUserById = (userId: number): Promise<User | undefined> => {
  return usersRepo.getUserById(userId);
};

export const getUserBySpotifyUserId = (
  spotifyUserId: string,
): Promise<User | undefined> => {
  return usersRepo.getUserBySpotifyUserId(spotifyUserId);
};
