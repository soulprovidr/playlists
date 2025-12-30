import { Hono } from "hono";
import { authRoutes } from "./auth/auth.routes";

const api = new Hono();

export const apiRoutes = api.route("/auth", authRoutes);

export type ApiType = typeof apiRoutes;
