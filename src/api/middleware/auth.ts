import { getSignedCookie } from "@cookies";
import { env } from "@env";
import { createMiddleware } from "@lib/middleware";
import { User } from "@modules/users/users.types";
import { verify } from "hono/jwt";
import { CookieName } from "../api.constants";

export const authMiddleware = createMiddleware(async (c, next) => {
  const userCookie = (await getSignedCookie(c, CookieName.USER)) as string;
  try {
    const user = (await verify(userCookie, env.COOKIE_SECRET)) as User;
    c.set("user", user);
    await next();
  } catch {
    return c.json({ error: "Unauthorized" }, 401);
  }
});
