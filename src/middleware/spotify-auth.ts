import { CookieName } from "@api/constants";
import { env } from "@env";
import * as spotifyApiService from "@modules/spotify/spotify-api.service";
import { getSignedCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";

export const spotifyAuth = createMiddleware(async (c, next) => {
  const spotifyUserId = await getSignedCookie(
    c,
    env.COOKIE_SECRET,
    CookieName.SPOTIFY_USER_ID,
  );

  if (spotifyUserId) {
    const spotifyUserToken =
      await spotifyApiService.getUserTokenByUserId(spotifyUserId);

    if (spotifyUserToken) {
      spotifyApiService.setCredentials(
        spotifyUserToken.access_token,
        spotifyUserToken.refresh_token,
      );
      return next();
    }
  }

  return c.redirect(spotifyApiService.createAuthorizeURL(), 302);
});
