import * as spotifyUsersRepo from "./spotify-users.repo";
import {
  SpotifyUser,
  SpotifyUserInsert,
  SpotifyUserUpdate,
} from "./spotify-users.types";

export const getSpotifyUserBySpotifyId = async (
  spotifyId: string,
): Promise<SpotifyUser | undefined> => {
  return spotifyUsersRepo.getSpotifyUserBySpotifyId(spotifyId);
};

export const insertSpotifyUser = async (
  user: SpotifyUserInsert,
): Promise<number> => {
  return spotifyUsersRepo.insertSpotifyUser(user);
};

export const updateSpotifyUserBySpotifyId = async (
  spotifyId: string,
  user: SpotifyUserUpdate,
): Promise<void> => {
  return spotifyUsersRepo.updateSpotifyUserBySpotifyId(spotifyId, user);
};
