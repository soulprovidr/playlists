import { env } from "@env";
import { getSignedCookie } from "@lib/helpers/cookies.helpers";
import { User } from "@modules/users/users.types";
import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import { CookieName } from "../api.constants";

type AuthMiddleware = {
  Variables: {
    user: User;
  };
};

export const authMiddleware = createMiddleware<AuthMiddleware>(
  async (c, next) => {
    const userCookie = (await getSignedCookie(c, CookieName.USER)) as string;
    try {
      const user = (await verify(userCookie, env.COOKIE_SECRET)) as User;
      c.set("user", user);
      await next();
    } catch {
      // TODO: Redirect to login page.
      return c.json({ error: "Not authorized." }, 401);
    }
  },
);
