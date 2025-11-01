import { env } from "@env";
import { createSignedCookieMethods } from "@lib/cookies";

export const { getSignedCookie, setSignedCookie, deleteSignedCookie } =
  createSignedCookieMethods(env.COOKIE_SECRET);
