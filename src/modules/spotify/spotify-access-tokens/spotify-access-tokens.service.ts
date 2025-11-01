import * as spotifyAccessTokensRepo from "./spotify-access-tokens.repo";
import {
  SpotifyAccessToken,
  SpotifyAccessTokenInsert,
  SpotifyAccessTokenUpdate,
} from "./spotify-access-tokens.types";

export const getSpotifyAccessTokenByUserId = async (
  userId: number,
): Promise<SpotifyAccessToken | undefined> => {
  return spotifyAccessTokensRepo.getSpotifyAccessTokenByUserId(userId);
};

export const insertSpotifyAccessToken = async (
  spotifyAccessTokenInsert: SpotifyAccessTokenInsert,
): Promise<number> => {
  return spotifyAccessTokensRepo.insertSpotifyAccessToken(
    spotifyAccessTokenInsert,
  );
};

export const updateSpotifyAccessTokenByUserId = async (
  userId: number,
  spotifyAccessTokenUpdate: SpotifyAccessTokenUpdate,
): Promise<void> => {
  return spotifyAccessTokensRepo.updateSpotifyAccessTokenByUserId(
    userId,
    spotifyAccessTokenUpdate,
  );
};

export const upsertSpotifyAccessToken = async (
  spotifyAccessTokenUpsert: SpotifyAccessTokenInsert,
): Promise<void> => {
  const spotifyAccessToken = await getSpotifyAccessTokenByUserId(
    spotifyAccessTokenUpsert.userId,
  );
  if (spotifyAccessToken) {
    await updateSpotifyAccessTokenByUserId(
      spotifyAccessTokenUpsert.userId,
      spotifyAccessTokenUpsert,
    );
  } else {
    await insertSpotifyAccessToken(spotifyAccessTokenUpsert);
  }
  return;
};
