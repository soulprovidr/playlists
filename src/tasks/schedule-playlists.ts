import { jobs } from "@jobs";
import { DayOfWeek } from "@js-joda/core";
import { logger } from "@logger";
import * as playlistConfigsRepo from "@modules/playlist-configs/playlist-configs.repo";
import * as playlistConfigsService from "@modules/playlist-configs/playlist-configs.service";
import {
  BuildCadence,
  BuildStatus,
} from "@modules/playlist-configs/playlist-configs.types";
import { buildPlaylist } from "@tasks/build-playlist";

/**
 * Get the current day of week as a string matching DayOfWeek enum values
 */
function getCurrentDayOfWeek(): string {
  const dayIndex = new Date().getDay(); // 0 = Sunday, 6 = Saturday
  const days = [
    DayOfWeek.SUNDAY.name(),
    DayOfWeek.MONDAY.name(),
    DayOfWeek.TUESDAY.name(),
    DayOfWeek.WEDNESDAY.name(),
    DayOfWeek.THURSDAY.name(),
    DayOfWeek.FRIDAY.name(),
    DayOfWeek.SATURDAY.name(),
  ];
  return days[dayIndex];
}

/**
 * Check all playlist configs and queue builds for those that should run today
 */
export async function schedulePlaylists(): Promise<void> {
  try {
    const currentDay = getCurrentDayOfWeek();
    logger.info(
      `[Scheduler] Checking for scheduled builds on ${currentDay}...`,
    );

    // Get all playlist configs with WEEKLY cadence
    const allConfigs = await playlistConfigsRepo.getAllPlaylistConfigs();

    const configsToRebuild = allConfigs.filter(
      (config) =>
        config.buildCadence === BuildCadence.WEEKLY &&
        config.buildDay === currentDay,
    );

    logger.info(
      `[Scheduler] Found ${configsToRebuild.length} playlist(s) to rebuild`,
    );

    // Queue a build job for each config
    for (const config of configsToRebuild) {
      logger.info(
        `[Scheduler] Queueing build for playlist: ${config.name} (ID: ${config.id})`,
      );

      // Set status to IN_PROGRESS
      await playlistConfigsService.updatePlaylistConfig(config.id, {
        buildStatus: BuildStatus.IN_PROGRESS,
      });

      jobs.add(
        async () => {
          try {
            await buildPlaylist(config.id);
            // Set status to COMPLETED on success
            await playlistConfigsService.updatePlaylistConfig(config.id, {
              buildStatus: BuildStatus.COMPLETED,
            });
          } catch (error) {
            logger.error(
              { err: error },
              `[Scheduler] Failed to build playlist ${config.id}`,
            );
            // Set status to ERRORED on failure
            await playlistConfigsService.updatePlaylistConfig(config.id, {
              buildStatus: BuildStatus.ERRORED,
            });
          }
        },
        {
          onSuccess: (jobId) =>
            logger.info(
              `[Scheduler] Playlist ${config.id} built successfully (${jobId})`,
            ),
          onError: (jobId, error) =>
            logger.error(
              { err: error },
              `[Scheduler] Playlist ${config.id} build failed (${jobId})`,
            ),
        },
      );
    }
  } catch (error) {
    logger.error({ err: error }, "[Scheduler] Error checking scheduled builds");
  }
}
