import { createEnv } from "@lib/env";
import { z } from "zod";

export const env = createEnv(
  z.object({
    // Application.
    APPLICATION_PORT: z.coerce.number(),
    CLIENT_URL: z.string(),
    COOKIE_SECRET: z.string(),
    NODE_ENV: z.enum(["development", "production"]),

    // Database.
    DATABASE_PATH: z.string(),

    // OpenAI.
    OPENAI_API_KEY: z.string(),

    // Spotify.
    SPOTIFY_CLIENT_ID: z.string(),
    SPOTIFY_CLIENT_SECRET: z.string(),
    SPOTIFY_REDIRECT_URI: z.string(),
  }),
);
