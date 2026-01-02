import * as spotifyApiService from "@modules/spotify/spotify-api.service";
import { schedulePlaylists } from "@tasks/schedule-playlists";
import { Hono } from "hono";
import * as authService from "./app.service";

export const appRoutes = new Hono()
  .get("/authorize", async (c) => {
    const spotifyApi = await spotifyApiService.getInstance();
    const spotifyAuthUrl = spotifyApi.createAuthorizeURL(
      ["playlist-modify-public", "playlist-modify-private"],
      "state",
    );
    return c.redirect(spotifyAuthUrl);
  })
  .get("/authorize/callback", async (c) => {
    const code = c.req.query("code");
    try {
      const user = await authService.authorizeSpotifyUser(code!);
      schedulePlaylists();
      return c.text(
        `Successfully authorized ${user.spotifyUserId}. You may now close this window.`,
      );
    } catch (e) {
      return c.text((e as Error).message, 500);
    }
  });
