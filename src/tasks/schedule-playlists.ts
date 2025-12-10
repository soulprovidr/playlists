import { jobs } from "@jobs";
import { DayOfWeek } from "@js-joda/core";
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
    console.log(
      `[Scheduler] Checking for scheduled builds on ${currentDay}...`,
    );

    // Get all playlist configs with WEEKLY cadence
    const allConfigs = await playlistConfigsRepo.getAllPlaylistConfigs();

    const configsToRebuild = allConfigs.filter(
      (config) =>
        config.buildCadence === BuildCadence.WEEKLY &&
        config.buildDay === currentDay,
    );

    console.log(
      `[Scheduler] Found ${configsToRebuild.length} playlist(s) to rebuild`,
    );

    // Queue a build job for each config
    for (const config of configsToRebuild) {
      console.log(
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
            console.error(
              `[Scheduler] Failed to build playlist ${config.id}:`,
              error,
            );
            // Set status to ERRORED on failure
            await playlistConfigsService.updatePlaylistConfig(config.id, {
              buildStatus: BuildStatus.ERRORED,
            });
          }
        },
        {
          onSuccess: (jobId) =>
            console.log(
              `[Scheduler] Playlist ${config.id} built successfully (${jobId})`,
            ),
          onError: (jobId, error) =>
            console.error(
              `[Scheduler] Playlist ${config.id} build failed (${jobId}):`,
              error,
            ),
        },
      );
    }
  } catch (error) {
    console.error("[Scheduler] Error checking scheduled builds:", error);
  }
}
