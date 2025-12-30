import * as databaseHelpers from "@database/database.helpers";
import { env } from "@env";
import { Instant, ZoneId } from "@js-joda/core";
import * as spotifyAccessTokensService from "@modules/spotify/spotify-access-tokens/spotify-access-tokens.service";
import SpotifyWebApi from "spotify-web-api-node";

export async function getInstance(
  spotifyUserId?: string,
): Promise<SpotifyWebApi> {
  const spotifyApi = new SpotifyWebApi({
    clientId: env.SPOTIFY_CLIENT_ID,
    clientSecret: env.SPOTIFY_CLIENT_SECRET,
    redirectUri: env.SPOTIFY_REDIRECT_URI,
  });

  if (!spotifyUserId) {
    return spotifyApi;
  }

  const spotifyAccessToken =
    await spotifyAccessTokensService.getSpotifyAccessTokenBySpotifyUserId(
      spotifyUserId,
    );

  if (spotifyAccessToken) {
    spotifyApi.setCredentials({
      accessToken: spotifyAccessToken.accessToken,
      refreshToken: spotifyAccessToken.refreshToken,
    });

    const expiresAt = databaseHelpers.getZonedDateTimeFromDatabaseTimestamp(
      spotifyAccessToken.expiresAt,
    );
    const now = Instant.now().atZone(ZoneId.UTC);
    if (expiresAt && expiresAt.isBefore(now)) {
      console.log("Refreshing access token...");
      const res = await spotifyApi.refreshAccessToken();
      if (res.statusCode === 200) {
        await spotifyAccessTokensService.upsertSpotifyAccessToken({
          id: spotifyAccessToken.id,
          spotifyUserId: spotifyAccessToken.spotifyUserId,
          accessToken: res.body.access_token,
          refreshToken:
            res.body.refresh_token || spotifyAccessToken.refreshToken,
          expiresAt: databaseHelpers.getDatabaseTimestampFromInstant(
            Instant.now().plusSeconds(res.body.expires_in),
          ),
        });
      } else {
        throw new Error("Failed to refresh access token.");
      }
    }
  }

  return spotifyApi;
}
