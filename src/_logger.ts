import { env } from "@env";
import pino from "pino";

// Create base logger
export const logger = pino({
  level: env.NODE_ENV === "production" ? "info" : "debug",
  transport:
    env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "HH:MM:ss Z",
            ignore: "pid,hostname",
          },
        }
      : undefined,
});

// Log startup message
logger.info(`Logger initialized in ${env.NODE_ENV} mode`);
