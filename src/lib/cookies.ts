import { Context } from "hono";
import { deleteCookie, getSignedCookie, setSignedCookie } from "hono/cookie";
import { CookieOptions, CookiePrefixOptions } from "hono/utils/cookie";
import _ from "lodash";

const DEFAULT_PREFIX_OPTION: CookiePrefixOptions = "host";

export const createSignedCookieMethods = (secret: string) => {
  return {
    getSignedCookie: async (
      c: Context,
      name: string,
      prefixOption: CookiePrefixOptions = DEFAULT_PREFIX_OPTION,
    ) => {
      return getSignedCookie(c, secret, name, prefixOption);
    },
    setSignedCookie: async (
      c: Context,
      name: string,
      value: string,
      options: CookieOptions = {},
    ) => {
      return setSignedCookie(
        c,
        name,
        value,
        secret,
        _.extend(
          { prefix: DEFAULT_PREFIX_OPTION } satisfies CookieOptions,
          options,
        ),
      );
    },
    deleteSignedCookie: (
      c: Context,
      name: string,
      options: {
        path?: string;
        secure?: boolean;
        domain?: string;
      } = {},
    ) => {
      return deleteCookie(
        c,
        name,
        _.extend(
          {
            prefix: DEFAULT_PREFIX_OPTION,
            path: "/",
            secure: true,
          },
          options,
        ),
      );
    },
  };
};
