import { env } from "@env";
import * as spotifyApiService from "@modules/spotify/spotify-api.service";
import { Hono } from "hono";
import * as authService from "./auth.service";

export const authRoutes = new Hono()
  .get("/", async (c) => {
    const spotifyApi = await spotifyApiService.getInstance();
    const spotifyAuthUrl = spotifyApi.createAuthorizeURL(
      ["playlist-modify-public", "playlist-modify-private"],
      "state",
    );
    return c.redirect(spotifyAuthUrl);
  })
  .get("/spotify", async (c) => {
    const code = c.req.query("code");
    try {
      const user = await authService.authorizeSpotifyUser(code!);
      await authService.setUserCookie(c, user!);
      return c.redirect(env.CLIENT_URL);
    } catch (e) {
      return c.text((e as Error).message, 500);
    }
  })
  .post("/logout", async (c) => {
    authService.deleteUserCookie(c);
    return c.json({ success: true });
  });
