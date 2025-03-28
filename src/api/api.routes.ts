import { Hono } from "hono";
import { dashboardRoutes } from "./dashboard";
import { playlistsRoutes } from "./playlists";

const api = new Hono();

export const apiRoutes = api
  .route("/dashboard", dashboardRoutes)
  .route("/playlists", playlistsRoutes);

export type ApiType = typeof apiRoutes;
