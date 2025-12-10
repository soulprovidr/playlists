import { apiRoutes } from "@api/api.routes";
import { authRoutes } from "@api/auth/auth.routes";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import { registerSchedulers } from "./_scheduler";

const app = new Hono();

app.use(logger());
app.use(secureHeaders());
app.use(contextStorage());
app.use(serveStatic({ root: "/dist/client" }));

app.route("/auth", authRoutes);
app.route("/api", apiRoutes);

// Initialize schedulers
registerSchedulers();

export default app;
