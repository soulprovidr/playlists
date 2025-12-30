import { apiRoutes } from "@api/api.routes";
import { logger } from "@logger";
import { seedPlaylists } from "@tasks/seed-playlists";
import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { secureHeaders } from "hono/secure-headers";
import cron from "node-cron";
import { schedulePlaylists } from "./tasks/schedule-playlists";

const app = new Hono();

// Middleware.
app.use(async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(`${c.req.method} ${c.req.path} ${c.res.status} - ${ms}ms`);
});
app.use(secureHeaders());
app.use(contextStorage());

app.route("/", apiRoutes);

const HOURLY_SCHEDULE = "0 * * * *"; // Run every hour
cron.schedule(HOURLY_SCHEDULE, async () => {
  logger.info("[Scheduler] Running scheduled playlist check...");
  await schedulePlaylists();
  logger.info("[Scheduler] Scheduled playlist check completed.");
});

// Startup tasks.
seedPlaylists();
schedulePlaylists();

export default app;
