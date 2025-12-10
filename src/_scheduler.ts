import * as cron from "node-cron";
import { schedulePlaylists } from "./tasks/schedule-playlists";

const DAILY_SCHEDULE = "0 0 * * *"; // Run at midnight every day

// Initialize and start all schedulers
export function registerSchedulers(): void {
  console.log("[Scheduler] Initializing schedulers...");

  cron.schedule(DAILY_SCHEDULE, () => {
    console.log("[Scheduler] Running scheduled playlist check...");
    schedulePlaylists().catch((error) => {
      console.error("[Scheduler] Error in scheduled task:", error);
    });
  });

  console.log("[Scheduler] All schedulers initialized.");
}
