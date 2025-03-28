import { env } from "@env";
import { getSpotifyApiInstance } from "@modules/spotify/spotify-api.service";
import * as usersService from "@modules/users/users.service";
import { Hono } from "hono";
import * as authService from "./auth.service";

export const authRoutes = new Hono()
  .get("/", async (c) => {
    const spotifyApiService = getSpotifyApiInstance();
    const spotifyAuthUrl = await spotifyApiService.createAuthorizeURL(
      ["playlist-modify-public", "playlist-modify-private"],
      "state",
    );
    return c.redirect(spotifyAuthUrl);
  })
  .get("/spotify", async (c) => {
    const code = c.req.query("code");
    try {
      const spotifyUserId = await authService.authorizeSpotifyUser(code!);
      const user = await usersService.getUserBySpotifyUserId(spotifyUserId);
      await authService.setUserCookie(c, user!);
      return c.redirect(env.CLIENT_URL);
    } catch (e) {
      return c.text((e as Error).message, 500);
    }
  });
