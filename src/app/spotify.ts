import { env } from "@env";
import SpotifyWebApi from "spotify-web-api-node";

export const spotifyApi = new SpotifyWebApi({
  clientId: env.SPOTIFY_CLIENT_ID,
  clientSecret: env.SPOTIFY_CLIENT_SECRET,
  redirectUri: env.SPOTIFY_REDIRECT_URI,
});

export const authorize = async (code: string | undefined): Promise<void> => {
  const response = await spotifyApi.authorizationCodeGrant(code!);
  if (response.statusCode === 200) {
    spotifyApi.setCredentials({
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

export const refreshAccessToken = async (): Promise<void> => {
  const response = await spotifyApi.refreshAccessToken();
  if (response.statusCode === 200) {
    spotifyApi.setAccessToken(response.body.access_token);
    if (response.body.refresh_token) {
      spotifyApi.setRefreshToken(response.body.refresh_token);
    }
    return;
  } else {
    throw new Error(
      `Failed to refresh Spotify access token: [${response.statusCode}] ${response.body}`,
    );
  }
};
