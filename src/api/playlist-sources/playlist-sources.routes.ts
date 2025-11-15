import { validatePlaylistSourceUrl } from "@modules/playlist-sources/playlist-sources.helpers";
import { Hono } from "hono";
import { z } from "zod";
import { ValidateUrlResponse } from "./playlist-sources.types";

const validateUrlBodySchema = z.object({
  url: z.string().url(),
});

const routes = new Hono();

export const playlistSourcesRoutes = routes.post("/validate-url", async (c) => {
  const body = await c.req.json();
  const parseResult = validateUrlBodySchema.safeParse(body);

  if (!parseResult.success) {
    return c.json<ValidateUrlResponse>(
      {
        valid: false,
        error: "Invalid URL format",
      },
      400,
    );
  }

  const { url } = parseResult.data;

  try {
    const result = await validatePlaylistSourceUrl(url);

    if (result.valid) {
      return c.json<ValidateUrlResponse>({
        valid: true,
        type: result.type,
        config: result.config,
      });
    }

    return c.json<ValidateUrlResponse>({
      valid: false,
      error: result.error || "Invalid URL",
    });
  } catch (error) {
    return c.json<ValidateUrlResponse>(
      {
        valid: false,
        error:
          error instanceof Error ? error.message : "Failed to validate URL",
      },
      500,
    );
  }
});

export type PlaylistSourcesRoutesType = typeof playlistSourcesRoutes;
