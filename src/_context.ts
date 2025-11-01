import { User } from "@modules/users/users.types";
import { getContext as getHonoContext } from "hono/context-storage";

export interface AppContext {
  Variables: {
    user: User;
  };
}

/**
 * Get the current user from Hono's context storage
 * This only works after the authMiddleware has been applied
 */
export function getCurrentUser(): User | undefined {
  try {
    const context = getHonoContext<AppContext>();
    return context?.get("user");
  } catch {
    // Context storage not available or user not set
    return undefined;
  }
}
