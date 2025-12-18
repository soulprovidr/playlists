import { logger } from "@logger";
import cron from "node-cron";
import { schedulePlaylists } from "./tasks/schedule-playlists";

const DAILY_SCHEDULE = "0 0 * * *"; // Run at midnight every day

// Initialize and start all schedulers
export function registerSchedulers(): void {
  logger.info("[Scheduler] Initializing schedulers...");

  cron.schedule(DAILY_SCHEDULE, () => {
    logger.info("[Scheduler] Running scheduled playlist check...");
    schedulePlaylists().catch((error) => {
      logger.error("[Scheduler] Error in scheduled task:", error);
    });
  });

  logger.info("[Scheduler] All schedulers initialized.");
}
