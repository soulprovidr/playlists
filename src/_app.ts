import { apiRoutes } from "@api/api.routes";
import { authRoutes } from "@api/auth/auth.routes";
import { serveStatic } from "@hono/node-server/serve-static";
import { logger } from "@logger";
import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { secureHeaders } from "hono/secure-headers";
import { registerSchedulers } from "./_scheduler";

const app = new Hono();

app.use(async (c, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  logger.info(`${c.req.method} ${c.req.path} ${c.res.status} - ${ms}ms`);
});
app.use(secureHeaders());
app.use(contextStorage());
app.use(serveStatic({ root: "/dist/client" }));

app.route("/auth", authRoutes);
app.route("/api", apiRoutes);

// Initialize schedulers
registerSchedulers();

export default app;
