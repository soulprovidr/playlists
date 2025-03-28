import { env } from "@env";
import SpotifyWebApi from "spotify-web-api-node";

export const getSpotifyApiInstance = (credentials?: {
  accessToken?: string | undefined;
  clientId?: string | undefined;
  clientSecret?: string | undefined;
  redirectUri?: string | undefined;
  refreshToken?: string | undefined;
}): SpotifyWebApi => {
  const instance = new SpotifyWebApi({
    clientId: env.SPOTIFY_CLIENT_ID,
    clientSecret: env.SPOTIFY_CLIENT_SECRET,
    redirectUri: env.SPOTIFY_REDIRECT_URI,
  });

  if (credentials) {
    instance.setCredentials(credentials);
  }

  return instance;
};
