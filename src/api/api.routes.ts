import { Hono } from "hono";
import { authRoutes } from "./auth/auth.routes";
import { dashboardRoutes } from "./dashboard/dashboard.routes";
import { debugRoutes } from "./debug/debug.routes";
import { playlistSourcesRoutes } from "./playlist-sources/playlist-sources.routes";
import { playlistsRoutes } from "./playlists/playlists.routes";

const api = new Hono();

export const apiRoutes = api
  .route("/auth", authRoutes)
  .route("/dashboard", dashboardRoutes)
  .route("/debug", debugRoutes)
  .route("/playlists", playlistsRoutes)
  .route("/playlist-sources", playlistSourcesRoutes);

export type ApiType = typeof apiRoutes;
