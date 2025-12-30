import { jobs } from "@jobs";
import { logger } from "@logger";
import * as playlistConfigsHelpers from "@modules/playlist-configs/playlist-configs.helpers";
import * as playlistConfigsRepo from "@modules/playlist-configs/playlist-configs.repo";
import * as playlistConfigsService from "@modules/playlist-configs/playlist-configs.service";
import { BuildStatus } from "@modules/playlist-configs/playlist-configs.types";
import { buildPlaylist } from "@tasks/build-playlist";

/**
 * Check all playlist configs and queue builds for those that should run today
 */
export async function schedulePlaylists(): Promise<void> {
  try {
    const allConfigs = await playlistConfigsRepo.getAllPlaylistConfigs();

    const configsToRebuild =
      playlistConfigsHelpers.getOverduePlaylistConfigs(allConfigs);
    if (configsToRebuild.length > 0) {
      logger.warn(
        `[schedulePlaylists] Found ${configsToRebuild.length} to be built.`,
      );
      configsToRebuild.forEach((config) => {
        logger.warn(
          `[schedulePlaylists] ${config.spotifyPlaylistId} (ID: ${config.id}) - scheduled for ${config.buildDay}, last built: ${config.lastBuiltDate}`,
        );
      });
    }

    if (!configsToRebuild.length) {
      logger.info("[schedulePlaylists] No playlists to schedule.");
      return;
    }

    // Queue a build job for each config
    for (const config of configsToRebuild) {
      logger.info(
        `[schedulePlaylists] Queueing build for playlist: ${config.spotifyPlaylistId} (ID: ${config.id})`,
      );

      await playlistConfigsService.updatePlaylistConfig(config.id, {
        buildStatus: BuildStatus.IN_PROGRESS,
      });

      jobs.add(buildPlaylist.bind(null, config.id), {
        onSuccess: (jobId) =>
          logger.info(
            `[schedulePlaylists] Playlist ${config.id} built successfully (${jobId})`,
          ),
        onError: (jobId, error) =>
          logger.error(
            { err: error },
            `[schedulePlaylists] Playlist ${config.id} build failed (${jobId})`,
          ),
      });
    }
  } catch (error) {
    logger.error(
      { err: error },
      "[schedulePlaylists] Error checking scheduled builds",
    );
  }
}
