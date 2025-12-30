import * as spotifyAccessTokensRepo from "./spotify-access-tokens.repo";
import {
  SpotifyAccessToken,
  SpotifyAccessTokenInsert,
  SpotifyAccessTokenUpdate,
} from "./spotify-access-tokens.types";

export async function getSpotifyAccessTokenBySpotifyUserId(
  spotifyUserId: string,
): Promise<SpotifyAccessToken | undefined> {
  return spotifyAccessTokensRepo.getSpotifyAccessTokenBySpotifyUserId(
    spotifyUserId,
  );
}

export async function insertSpotifyAccessToken(
  spotifyAccessTokenInsert: SpotifyAccessTokenInsert,
): Promise<number> {
  return spotifyAccessTokensRepo.insertSpotifyAccessToken(
    spotifyAccessTokenInsert,
  );
}

export async function updateSpotifyAccessTokenBySpotifyUserId(
  spotifyUserId: string,
  spotifyAccessTokenUpdate: SpotifyAccessTokenUpdate,
): Promise<void> {
  return spotifyAccessTokensRepo.updateSpotifyAccessTokenBySpotifyUserId(
    spotifyUserId,
    spotifyAccessTokenUpdate,
  );
}

export async function upsertSpotifyAccessToken(
  spotifyAccessTokenUpsert: SpotifyAccessTokenInsert,
): Promise<void> {
  const spotifyAccessToken = await getSpotifyAccessTokenBySpotifyUserId(
    spotifyAccessTokenUpsert.spotifyUserId,
  );
  if (spotifyAccessToken) {
    await updateSpotifyAccessTokenBySpotifyUserId(
      spotifyAccessTokenUpsert.spotifyUserId,
      spotifyAccessTokenUpsert,
    );
  } else {
    await insertSpotifyAccessToken(spotifyAccessTokenUpsert);
  }
  return;
}
