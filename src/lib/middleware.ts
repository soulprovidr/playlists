import { AppContext } from "@context";
import { MiddlewareHandler } from "hono";
import { createMiddleware as honoCreateMiddleware } from "hono/factory";

export const createMiddleware = (handler: MiddlewareHandler<AppContext>) => {
  return honoCreateMiddleware(handler);
};
