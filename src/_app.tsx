import { apiRoutes, authRoutes } from "@api";
import { serveStatic } from "@hono/node-server/serve-static";
import { Hono } from "hono";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";

const app = new Hono();

app.use(logger());
app.use(secureHeaders());

app.use("*", serveStatic({ root: "/dist/client" }));

app.route("/authorize", authRoutes);
app.route("/api", apiRoutes);

export default app;
