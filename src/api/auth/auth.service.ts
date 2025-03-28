import { env } from "@env";
import { Instant } from "@js-joda/core";
import { getDatabaseTimestampFromInstant } from "@lib/helpers";
import { setSignedCookie } from "@lib/helpers/cookies.helpers";
import { getSpotifyApiInstance } from "@modules/spotify/spotify-api.service";
import * as spotifyUsersService from "@modules/spotify/spotify-users/spotify-users.service";
import * as usersService from "@modules/users/users.service";
import { User } from "@modules/users/users.types";
import { Context } from "hono";
import { sign } from "hono/jwt";
import { CookieName } from "../api.constants";

export const authorizeSpotifyUser = async (code: string): Promise<string> => {
  const spotifyApiService = getSpotifyApiInstance();

  const {
    body: {
      access_token: accessToken,
      expires_in: expiresIn,
      refresh_token: refreshToken,
    },
  } = await spotifyApiService.authorizationCodeGrant(code);
  spotifyApiService.setCredentials({ accessToken, refreshToken });

  const {
    body: { id: spotifyUserId },
  } = await spotifyApiService.getMe();
  const existingUser = await usersService.getUserBySpotifyUserId(spotifyUserId);

  if (!existingUser) {
    await usersService.insertUser({ spotifyUserId });
    await spotifyUsersService.insertSpotifyUser({
      spotifyUserId,
      expiresAt: getDatabaseTimestampFromInstant(
        Instant.now().plusSeconds(expiresIn),
      ),
      accessToken: accessToken,
      refreshToken: refreshToken,
    });
  } else {
    await spotifyUsersService.updateSpotifyUserBySpotifyId(spotifyUserId, {
      accessToken: accessToken,
      refreshToken: refreshToken,
      expiresAt: getDatabaseTimestampFromInstant(
        Instant.now().plusSeconds(expiresIn),
      ),
    });
  }

  return spotifyUserId;
};

export const setUserCookie = async (c: Context, user: User): Promise<void> => {
  const userJwt = await sign(user, env.COOKIE_SECRET);
  return setSignedCookie(c, CookieName.USER, userJwt, {
    httpOnly: true,
    maxAge: 24 * 60 * 60,
    path: "/",
    sameSite: "Strict",
    secure: true,
  });
};
