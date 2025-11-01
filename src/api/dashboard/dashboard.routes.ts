import { Hono } from "hono";
import { authMiddleware } from "../middleware/auth";
import * as dashboardService from "./dashboard.service";

export const dashboardRoutes = new Hono()
  .use(authMiddleware)
  .get("/", async (c) => {
    const { id: userId } = c.var.user;
    const dashboardPlaylists =
      await dashboardService.getDashboardViewResponse(userId);
    return c.json(dashboardPlaylists);
  });
