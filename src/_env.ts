import { createEnv } from "@lib/env";
import { z } from "zod";

export const env = createEnv(
  z.object({
    // Application variables.
    APPLICATION_PORT: z.coerce.number(),
    CLIENT_URL: z.string(),
    COOKIE_SECRET: z.string(),
    DATABASE_PATH: z.string(),
    NODE_ENV: z.enum(["development", "production"]),

    // OpenAI variables.
    OPENAI_API_KEY: z.string(),

    // Spotify variables.
    SPOTIFY_CLIENT_ID: z.string(),
    SPOTIFY_CLIENT_SECRET: z.string(),
    SPOTIFY_REDIRECT_URI: z.string(),
  }),
);
