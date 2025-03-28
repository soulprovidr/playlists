import { env } from "@env";
import { Context } from "hono";
import {
  getSignedCookie as _getSignedCookie,
  setSignedCookie as _setSignedCookie,
} from "hono/cookie";
import { CookieOptions, CookiePrefixOptions } from "hono/utils/cookie";
import _ from "lodash";

export const getSignedCookie = async (
  c: Context,
  name: string,
  prefixOption: CookiePrefixOptions = "host",
) => {
  return _getSignedCookie(c, env.COOKIE_SECRET, name, prefixOption);
};

export const setSignedCookie = async (
  c: Context,
  name: string,
  value: string,
  options: CookieOptions = {},
) => {
  return _setSignedCookie(
    c,
    name,
    value,
    env.COOKIE_SECRET,
    _.extend({ prefix: "host" } satisfies CookieOptions, options),
  );
};
