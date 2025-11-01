import { Hono } from "hono";
import { authRoutes } from "./auth/auth.routes";
import { dashboardRoutes } from "./dashboard/dashboard.routes";
import { playlistsRoutes } from "./playlists/playlists.routes";

const api = new Hono();

export const apiRoutes = api
  .route("/auth", authRoutes)
  .route("/dashboard", dashboardRoutes)
  .route("/playlists", playlistsRoutes);

export type ApiType = typeof apiRoutes;
