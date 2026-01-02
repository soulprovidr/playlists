import { createEnv } from "@lib/env";
import { z } from "zod";

export const env = createEnv(
  z.object({
    // Application.
    NODE_ENV: z.enum(["development", "production"]),
    HOST: z.string(),
    PORT: z.coerce.number(),

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
