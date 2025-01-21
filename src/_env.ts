import { createEnv } from "@lib/env";
import { z } from "zod";

export const env = createEnv(
  z.object({
    OPENAI_API_KEY: z.string(),
    SERVER_PORT: z.coerce.number(),
    SPOTIFY_CLIENT_ID: z.string(),
    SPOTIFY_CLIENT_SECRET: z.string(),
    SPOTIFY_REDIRECT_URI: z.string(),
  }),
);
