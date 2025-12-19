import { apiRoutes } from "@api/api.routes";
import { authRoutes } from "@api/auth/auth.routes";
import { serveStatic } from "@hono/node-server/serve-static";
import { logger } from "@logger";
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
app.use(serveStatic({ root: "/dist/client" }));

// Register routes.
app.route("/auth", authRoutes);
app.route("/api", apiRoutes);

// Schedule tasks.
const HOURLY_SCHEDULE = "0 * * * *"; // Run every hour

cron.schedule(HOURLY_SCHEDULE, async () => {
  logger.info("[Scheduler] Running scheduled playlist check...");
  await schedulePlaylists();
  logger.info("[Scheduler] Scheduled playlist check completed.");
});

// Startup tasks.
schedulePlaylists();

export default app;
