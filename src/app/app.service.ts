import { getSpotifyUserId } from "@config";
import { getDatabaseTimestampFromInstant } from "@database";
import { Instant } from "@js-joda/core";
import * as spotifyAccessTokensService from "@modules/spotify/spotify-access-tokens/spotify-access-tokens.service";
import * as spotifyApiService from "@modules/spotify/spotify-api.service";

export interface AuthorizedUser {
  spotifyUserId: string;
}

export async function authorizeSpotifyUser(
  code: string,
): Promise<AuthorizedUser> {
  const spotifyApi = await spotifyApiService.getInstance();

  const {
    body: {
      access_token: accessToken,
      expires_in: expiresIn,
      refresh_token: refreshToken,
    },
  } = await spotifyApi.authorizationCodeGrant(code);
  spotifyApi.setCredentials({ accessToken, refreshToken });

  const {
    body: { id: spotifyUserId },
  } = await spotifyApi.getMe();

  if (getSpotifyUserId() != spotifyUserId) {
    throw new Error("You can't use this app (yet).");
  }

  await spotifyAccessTokensService.upsertSpotifyAccessToken({
    spotifyUserId,
    accessToken,
    refreshToken,
    expiresAt: getDatabaseTimestampFromInstant(
      Instant.now().plusSeconds(expiresIn),
    ),
  });

  return { spotifyUserId };
}
