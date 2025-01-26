import { database } from "@database";
import { env } from "@env";
import SpotifyWebApi from "spotify-web-api-node";

export const api = new SpotifyWebApi({
  clientId: env.SPOTIFY_CLIENT_ID,
  clientSecret: env.SPOTIFY_CLIENT_SECRET,
  redirectUri: env.SPOTIFY_REDIRECT_URI,
});

export async function authorizeUser(): Promise<void> {
  const userToken = await database
    .selectFrom("spotify_user_tokens")
    .selectAll()
    .executeTakeFirst();

  if (!userToken) {
    console.log(`
      Authorize Spotify at:
      ${api.createAuthorizeURL(
        ["playlist-modify-public", "playlist-modify-private"],
        "state",
      )}
    `);
    return;
  }

  api.setAccessToken(userToken.access_token);
  api.setRefreshToken(userToken.refresh_token);

  await refreshToken();

  return;
}

export const handleUserAuthCode = async (
  code: string | undefined,
): Promise<void> => {
  const response = await api.authorizationCodeGrant(code!);
  if (response.statusCode === 200) {
    api.setCredentials({
      accessToken: response.body.access_token,
      refreshToken: response.body.refresh_token,
    });
    return;
  } else {
    throw new Error(
      `Failed to authorize Spotify: [${response.statusCode}] ${response.body}`,
    );
  }
};

export const refreshToken = async (): Promise<void> => {
  const response = await api.refreshAccessToken();
  if (response.statusCode === 200) {
    api.setAccessToken(response.body.access_token);
    if (response.body.refresh_token) {
      api.setRefreshToken(response.body.refresh_token);
    }
    return;
  } else {
    throw new Error(
      `Failed to refresh Spotify access token: [${response.statusCode}] ${response.body}`,
    );
  }
};
