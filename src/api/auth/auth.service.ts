import { deleteSignedCookie, setSignedCookie } from "@cookies";
import { getDatabaseTimestampFromInstant } from "@database";
import { env } from "@env";
import { Instant } from "@js-joda/core";
import * as spotifyAccessTokensService from "@modules/spotify/spotify-access-tokens/spotify-access-tokens.service";
import * as spotifyApiService from "@modules/spotify/spotify-api.service";
import * as usersService from "@modules/users/users.service";
import { User } from "@modules/users/users.types";
import { Context } from "hono";
import { sign } from "hono/jwt";
import { CookieName } from "../api.constants";

export const authorizeSpotifyUser = async (code: string): Promise<User> => {
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
  let user = await usersService.getUserBySpotifyUserId(spotifyUserId);

  if (!user) {
    const userId = await usersService.insertUser({ spotifyUserId });
    user = (await usersService.getUserById(userId)) as User;
  }

  await spotifyAccessTokensService.upsertSpotifyAccessToken({
    userId: user.id,
    accessToken,
    refreshToken,
    expiresAt: getDatabaseTimestampFromInstant(
      Instant.now().plusSeconds(expiresIn),
    ),
  });
  return user;
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

export const deleteUserCookie = (c: Context): void => {
  deleteSignedCookie(c, CookieName.USER, {
    path: "/",
    secure: true,
  });
};
